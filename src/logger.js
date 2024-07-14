import winston from "winston";

const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ message, timestamp }) => {
	return `${message} ${timestamp}`;
});

const logger = winston.createLogger({
	format: winston.format.json(),
	level: "info",
	format: combine(timestamp(), logFormat),

	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: "combined.log"}),
	],
});

export default logger;
