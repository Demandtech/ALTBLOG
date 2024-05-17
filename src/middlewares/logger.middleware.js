const logger = (req, res, next) => {
	console.log({
		url: req.url,
		method: req.method,
		time: new Date(),
		body: req.body,
		query: req.query,
		params: req.params,
	});
    next()
};



export default logger;
