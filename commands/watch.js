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
		let price = args[1].toLowerCase();

		if (args.length > 3) {
			expiration = args[3];
		}

		if (price != '-') {
			if (price[0] == '$') {
				price = Number(price.slice(1));
			}
			else {
				price = Number(price);
			}
		}

		const watch = {
			type: args[0].toLowerCase(),
			price: price,
			other: args[2].split(':').map(e => e.toLowerCase()),
			madeBy: message.author.id,
			expiresOn: new Date(expiration),
		};

		fs.readFile('./data/watches.json', 'utf8', (err, data) => {
			if (err) throw err;
			const txt = JSON.parse(data);
			txt.data.push(watch);
			fs.writeFile('./data/watches.json', JSON.stringify(txt), function(err) {
				if (err) throw err;
				message.channel.send('Watch successfully added!');
				return true;
			});
		});
	},
};