import jwt from "jsonwebtoken";

const generateJWT = (user, jwtSec) => {
	return jwt.sign(
		{
			role: user?.role || "USER",
			email: user.email,
			_id: user._id,
			sub: user._id,
			name: user.first_name,
		},
		jwtSec,
		{ expiresIn: "30d" }
	);
};

export default generateJWT;
