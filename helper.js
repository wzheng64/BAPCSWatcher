function alertUsers(post, watches) {
	const title = post.title.toLowerCase();
	const titleArray = title.toLowerCase().split(' ');
	const type = title.match(/\[(\w+[ *\w*]*)\]/)[1].toLowerCase();
	// Find the price which should be a number starting with a dollar sign
	let price = title.match(/\$(\d+\.*\d*)/);
	// User who posted the deal may have omitted the dollar sign so we will
	// have to match via a different way
	if (!price) {
		// Extract the deal info, which should be surrounded by
		// parantheses.
		const dealInfo = title.match(/\(.+\)/);
		// Omit the deal info
		const newTitle = title.replace(dealInfo, '');
		// Get all numbers in the title
		const numbers = newTitle.match(/\d+\.*\d*/g);
		// We assume that the convention is that the price is the last
		// number in the title. Since we omitted the deal info, numbers
		// in those will not show.
		price = numbers[numbers.length - 1];
	}
	else {
		// We omit the dollar sign so we can convert the price into
		// a number later for comparison
		price = price[0].slice(1);
	}
	// Convert the string to a number for comparison
	price = Number(price);
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
			watch.madeBy.send('Here\'s a link to a deal that triggered a watch!');
			return watch.madeBy.send(data, { split: true });
		}
	});
}

module.exports = {
	alertUsers: alertUsers,
};