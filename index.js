const fs = require('fs');
const Discord = require('discord.js');
const snoowrap = require('snoowrap');
const fetch = require('node-fetch');
const google = require('googleapis');

const {
	prefix,
	token,
	clientId,
	clientSecret,
	redditUsername,
	redditPW,
} = require('./config.json');
const helperOperations = require('./helper.js');
const serviceAccount = require('./fb.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const scopes = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/firebase',
];

const jwtClient = new google.Auth.JWT(
	serviceAccount.client_email,
	null,
	serviceAccount.private_key,
	scopes,
);
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
let accessToken = null;
let posts = null;
let watches = null;

jwtClient.authorize((error, tokens) => {
	if (error) {
		console.log('Error making request to generate access token:', error);
	}
	else if (tokens.access_token === null) {
		console.log('Provided service account does not have permission to generate access tokens');
	}
	else {
		accessToken = tokens.access_token;
		posts = fetch(`https://bapcswatcher.firebaseio.com/posts.json?access_token=${accessToken}`)
			.then(res => res.text())
			.then(body => JSON.parse(body));

		watches = fetch(`https://bapcswatcher.firebaseio.com/watches.json?access_token=${accessToken}`)
			.then(res => res.text())
			.then(body => JSON.parse(body));
	}
});

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

const r = new snoowrap({
	userAgent: 'test /u/username',
	clientId: clientId,
	clientSecret: clientSecret,
	username: redditUsername,
	password: redditPW,
});

client.once('ready', () => {
	try {
		fetch(`https://bapcswatcher.firebaseio.com/posts.json?access_token=${accessToken}`)
			.then(res => res.text())
			.then(body => posts = JSON.parse(body))
			.then(() => fetch(`https://bapcswatcher.firebaseio.com/watches.json?access_token=${accessToken}`))
			.then(res => res.text())
			.then(body => watches = JSON.parse(body))
			.then(() => r.getNew('buildapcsales'))
			.then(listing => {
				// Return all posts from new that are not in posts
				const currentNew = {};
				listing.map(post => {
					currentNew[post.id] = post.permalink;
				});
				const body = JSON.stringify(currentNew);
				fetch(`https://bapcswatcher.firebaseio.com/posts.json?access_token=${accessToken}`, {
					method: 'PUT',
					body: body,
				});
				return listing.filter(post => !(post.id in posts));
			})
			.then(newPosts => {
				newPosts.map(e => helperOperations.alertUsers(client, e, watches));
			});
	}
	catch (error) {
		console.log(error);
	}
	console.log('Ready!');
});

client.on('message', message => {
	// Checks to make sure the command sent has the proper prefix and is from a USER
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	// First word is considered the command and the rest of the args contain the arguments
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) ||
		client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'texecute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	// A variable that gets the necessary cooldown amount. If you don't supply it in the command file
	// it will default to 3. The 1000 converts ms to seconds.
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	// Try to execute the command
	try {
		command.execute(message, args, accessToken);
	}
	catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

setInterval(() => {
	try {
		// Check the time, if its close to midnight
		// Check watches and remove any that have expired
		fetch(`https://bapcswatcher.firebaseio.com/posts.json?access_token=${accessToken}`)
			.then(res => res.text())
			.then(body => posts = JSON.parse(body))
			.then(() => fetch(`https://bapcswatcher.firebaseio.com/watches.json?access_token=${accessToken}`))
			.then(res => res.text())
			.then(body => watches = JSON.parse(body))
			.then(() => r.getNew('buildapcsales'))
			.then(listing => {
				// Return all posts from new that are not in posts
				const currentNew = {};
				listing.map(post => {
					currentNew[post.id] = post.permalink;
				});
				const body = JSON.stringify(currentNew);
				fetch(`https://bapcswatcher.firebaseio.com/posts.json?access_token=${accessToken}`, {
					method: 'PUT',
					body: body,
				});
				return listing.filter(post => !(post.id in posts));
			})
			.then(newPosts => {
				newPosts.map(e => helperOperations.alertUsers(client, e, watches));
				console.log(watches);
				console.log('Alert users of new deals!');
			});
	}
	catch (error) {
		console.log(error);
	}
}, 60000);

client.login(token);