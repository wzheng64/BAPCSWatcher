const fs = require('fs');

module.exports = {
	name: 'watches',
	description: 'Reports back all your current watches',
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
		const months = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		];
		const alerts = [];
		if (!args.length) {
			const id = message.author.id;
			alerts.push('Here\'s a list of all your current watches.');
			fs.readFile('./data/watches.json', 'utf8', (err, data) => {
				if (err) throw err;
				const watches = JSON.parse(data).data;
				watches.forEach(e => {
					if (e.madeBy == id) {
						const date = new Date(e.expiresOn);
						const dateString = `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
						alerts.push(`Product type: ${e.type}	Price: $${e.price}	Other specs: ${e.other.join(', ')}	Expires on: ${dateString}`);
					}
				});
				// Attempt to DM the requesting user command information
				// the split parameter will try to break up the info
				// if it exceeds 2000 characters
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