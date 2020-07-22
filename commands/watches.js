const fs = require('fs');

module.exports = {
	name: 'watches',
	description: 'Reports back all your current watches',
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
		let watches = [];
		if (!args.length) {
			const id = message.author.id;
			watches.push('Here\'s a list of all your current watches.');
			fs.readFile('./data/watch.json', 'utf8', (err, data) => {
				if (err) throw err;
				watches = JSON.parse(data).data;
				watches.forEach(e => {
					if (e.madeBy.id == id) {
						watches.push(`Product type: ${e.type}	Price: ${e.price}	Other specs: ${e.other.join(', ')}	Expires on: ${e.expiresOn}`);
					}
				});
				// Attempt to DM the requesting user command information
				// the split parameter will try to break up the info
				// if it exceeds 2000 characters
				return message.author.send(data, { split: true })
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