const fetch = require('node-fetch');
const discord = require('discord.js');

module.exports = {
	name: 'watches',
	description: 'Reports back all your current watches',
	execute(message, args, token) {
		const months = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'];
		const embed = new discord.MessageEmbed()
			.setColor('#eb9b34')
			.setAuthor(message.author.username, message.author.avatarURL())
			.setTitle('Watches')
			.setDescription('Watches set by you!')
			.setTimestamp();
		if (!args.length) {
			fetch(`https://bapcswatcher.firebaseio.com/watches/${message.author.id}.json?access_token=${ token }`)
				.then((res, error) => {
					if (error) throw error;
					return res.text();
				})
				.then(body => JSON.parse(body))
				.then(userWatches => {
					for (const watchID in userWatches) {
						const e = userWatches[watchID];
						const date = new Date(e.expiresOn);
						const dateString = `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
						embed.addField(`ID: ${watchID}`, `Product type: ${e.type}	Price: $${e.price}	Other specs: ${e.other.join(', ')}\nExpires on: ${dateString} \n`);
						embed.addField('\u200b', '\u200b');
					}
					return message.author.send({ embed: embed })
						.then(() => {
							if (message.channel.type === 'dm') return;
							message.reply('I\'ve send you a DM with all of your watches!');
						})
						.catch(error => {
							console.error(`Could not send DM to ${message.author.tag}.\n`, error);
							message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
						});
				});
		}
	},
};