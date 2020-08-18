const fetch = require('node-fetch');

module.exports = {
	name: 'watch',
	description: 'Set a watch for a deal.\nIf you don\'t want to set a search field, just replace it with \'-\'.',
	args: true,
	usage: '<Product Type> <Price> [Other details] <expiration date>(optional)',
	cooldown: 10,
	execute(message, args, token) {
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
			expiresOn: new Date(expiration),
		};
		fetch(`https://bapcswatcher.firebaseio.com/watches/${message.author.id}.json?access_token=${ token }`, {
			method: 'POST',
			body: JSON.stringify(watch),
		}).then((res, error) => {
			if (error) throw error;
			message.channel.send('Watch successfully added!');
			return true;
		})
		;
	},
};