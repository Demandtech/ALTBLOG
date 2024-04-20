import Jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
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
		const decoded = Jwt.verify(token, jwtsec);

		req.user = decoded;

		next();
	} catch (error) {
		return res.status(401).json({ message: error.message });
	}
};
