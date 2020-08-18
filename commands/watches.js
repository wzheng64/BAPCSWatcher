const fetch = require('node-fetch');

module.exports = {
	name: 'watches',
	description: 'Reports back all your current watches',
	execute(message, args, token) {
		const months = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'];
		const alerts = [];
		if (!args.length) {
			alerts.push('Here\'s a list of all your current watches.');
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
						alerts.push(`Watch ID: ${watchID}`);
						alerts.push(`Product type: ${e.type}	Price: $${e.price}	Other specs: ${e.other.join(', ')}	Expires on: ${dateString} \n`);
					}
					return message.author.send(alerts.join('\n'), { split: true })
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