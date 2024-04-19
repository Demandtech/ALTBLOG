import Jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
	// console.log(req.headers);
	const authorization = req.headers.authorization;

	if (!authorization) {
		return res.status(401).json({ message: "Unauthorized user" });
	}

	const [bearer, token] = authorization.split(" ");

	if ((bearer != "Bearer", !token)) {
		return res.status(401).json({ message: "Unauthorized user" });
	}

	const jwtsec = process.env.JWT_SECRET;

	try {
		// Jwt.verify(token, jwtsec, (error, decoded) => {
		// 	if (error) {
		// 		return res.status(401).json({ message: "Invalid Token" });
		// 	}

		// 	req.user = decoded;
		// 	next();
		// });
		const decoded = Jwt.verify(token, jwtsec);

		req.user = decoded;

		next();
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ message: "Invalid token" });
		}
		return res.status(500).json({ message: "Internal server error" });
	}
};
