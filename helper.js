function alertUsers(post, watches) {
	const title = post.title.toLowerCase();
	const titleArray = title.toLowerCase().split(' ');
	const type = title.match(/\[(\w+)\]/)[1].toLowerCase();
	const price = Number(title.match(/\$\d+\.*\d+/)[0].slice(1));
	watches.forEach(watch => {
		const typeAlert = watch.type == '_' || watch.type == type;
		const priceAlert = watch.price == '_' || watch.price <= price;
		let otherAlert = true;
		watch.other.forEach(element => {
			if (!titleArray.includes(element)) {
				otherAlert = false;
			}
		});
		if (typeAlert && priceAlert && otherAlert) {
			const data = 'https://www.reddit.com/' + post.permalink;
			watch.madeBy.send('Here\'s a link to a deal that triggered a watch!')
			return watch.madeBy.send(data, { split: true });
		}
	});
}

module.exports = {
	alertUsers: alertUsers,
};