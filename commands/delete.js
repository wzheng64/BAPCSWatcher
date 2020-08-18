const fetch = require('node-fetch');

module.exports = {
	name: 'delete',
	description: 'Will delete a watch based on an ID. To get IDs, call the watches command.',
	args: true,
	usage: '<Watch ID>',
	cooldown: 5,
	execute(message, args, token) {
		fetch(`https://bapcswatcher.firebaseio.com/watches/${message.author.id}/${args[0]}.json?access_token=${ token }`, {
			method: 'DELETE',
		}).then((res, error) => {
			if (error) throw error;
			message.channel.send('Watch successfully deleted!');
			return true;
		});
	},
};