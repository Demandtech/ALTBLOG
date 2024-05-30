import Jwt from "jsonwebtoken";

export const checkAuthenticate = (auth) => {
	if (!auth) return null;

	const [bearer, token] = auth.split(" ");

	const jwtsec = process.env.JWT_SECRET;

	const decoded = Jwt.verify(token, jwtsec);

	return decoded._id;
};
