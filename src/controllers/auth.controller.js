import { register, login } from "../services/auth.service.js";

export const handleRegister = async (req, res) => {
	try {
		const { email, password, last_name, first_name, role } = req.body;

		const newUser = await register(
			email,
			password,
			last_name,
			first_name,
			role
		);

		res
			.status(201)
			.json({ message: "User created successfully", data: { user: newUser } });
	} catch (error) {
		res.status(error.status || 500);
		res.json({ message: error?.message || "Internal Error" });
	}
};

export const handleLogin = async (req, res) => {
	const { email, password } = req.body;

	try {
		const { token, user } = await login(email, password);

		res.json({ message: "Login succesful", token, user });
	} catch (error) {
		res.status(error.status || 500);
		res.json({ message: error?.message || "Internal Error" });
	}
};
