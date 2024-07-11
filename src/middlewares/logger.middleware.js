import logger from "../logger.js";

const requestLogger = (req, res, next) => {
	const start = Date.now();
	const requestSize = req.headers["content-length"] || "unknown";

	res.on("finish", () => {
		const duration = Date.now() - start;
		logger.info(
			`${req.method} ${req.url} ${res.statusCode} ${duration}ms - Request size: ${requestSize} bytes`
		);
	});

	next();
};

export default requestLogger;
