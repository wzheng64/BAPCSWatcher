const fs = require('fs');
const Discord = require('discord.js');
const snoowrap = require('snoowrap');
const { prefix, token, clientId, clientSecret, redditUsername, redditPW } = require('./config.json');
const helperOperations = require('./helper.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const posts = JSON.parse(fs.readFileSync('./data/posts.json'));
const watches = JSON.parse(fs.readFileSync('./data/watches.json'));

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
	// r.getNew('buildapcsales').then(x => {
	// 	console.log(x);
	// 	console.log(x.length);
	// });
	// watches.data.forEach(element => {
	// 	client.users.fetch(element.madeBy.id)
	// 		.then(u => u.send('Hello'));
	// });
	console.log('Ready!');
});

client.on('message', message => {
	// Checks to make sure the command sent has the proper prefix and is from a USER
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	// First word is considered the command and the rest of the args contain the arguments
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

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
		command.execute(message, args);
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
		
		r.getNew('buildapcsales')
			.then(listing => {
				// Return all posts from new that are not in posts
				return listing.filter(post => !(post.id in posts));
			})
			.then(newPosts => {
				newPosts.map(e => helperOperations.alertUsers(client, e, watches.data));
				newPosts.map(e => {
					posts[e.id] = e.permalink;
				});
				fs.writeFileSync('./data/posts.json', JSON.stringify(posts), function(err) {
					if (err) throw err;
					console.log('New posts added!');
				});
			});
	}
	catch (error) {
		console.log(error);
	}
	// try {
	// 	r.getNew('buildapcsales').then(x => {
	// 		console.log(x[0].title);
	// 		console.log(x[0].url);
	// 		console.log('https://www.reddit.com/' + x[0].permalink);
	// 		console.log(x[0].id);
	// 		console.log(x[0].created_utc);

	// 		const title = x[0].title.toLowerCase();

	// 		const typeRE = /\[\w+\]/;
	// 		console.log(title.match(typeRE));
	// 		const type = title.match(typeRE)[0];
	// 		console.log('keyBoarD'.toLowerCase() == (type.slice(1, type.length - 1)).toLowerCase());

	// 		const priceRE = /\$\d+\.*\d+/;
	// 		console.log(title.match(priceRE));
	// 		const price = Number(title.match(priceRE)[0]);
	// 		console.log(Number('100') <= price);

	// 		const others = ['RGB', 'MECHANICAL'];
	// 		const titleArray = title.toLowerCase().split(' ');
	// 		others.map(e => console.log(titleArray.includes(e.toLowerCase())));
	// 	});
	// }
	// catch (error) {
	// 	console.log(error);
	// }
}, 60000);

client.login(token);