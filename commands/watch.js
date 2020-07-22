const fs = require('fs');

module.exports = {
	name: 'watch',
	description: 'Set a watch for a deal',
	args: true,
	usage: '<Product Type> <Price> [Other details] <expiration date>(optional)',
	cooldown: 10,
	execute(message, args) {
		// Default expiration date is 30 days after the watch is set
		// 2592000000 is the number of milliseconds which is added to
		// the epoch timestamp
		let expiration = message.createdTimestamp + 2592000000;

		if (args.length > 3) {
			expiration = args[3];
		}

		const watch = {
			type: args[0],
			price: args[1],
			other: args[2].split(':'),
			madeBy: message.author,
			expiresOn: new Date(expiration),
		};

		fs.readFile('./data/watches.json', 'utf8', (err, data) => {
			if (err) throw err;
			const txt = JSON.parse(data);
			txt.data.push(watch);
			fs.writeFile('./data/flame.json', JSON.stringify(txt), function(err) {
				if (err) throw err;
				message.channel.send('Flame successfully added!');
				return true;
			});
		});
	},
};