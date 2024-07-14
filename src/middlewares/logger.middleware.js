import logger from "../logger.js";

const requestLogger = async (req, res, next) => {
	const start = Date.now();


	await next();

	res.on("finish", () => {
		const duration = Date.now() - start;
		logger.info(
			`${req.method} ${req.url} ${res.statusCode} ${duration}ms`
		);
	});

	
};

export default requestLogger;
