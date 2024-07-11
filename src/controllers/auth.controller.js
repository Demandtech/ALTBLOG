import { register, login, changePassword } from "../services/auth.service.js";

export const handleRegister = async (req, res) => {
	try {
		const { email, password, last_name, first_name, profession } = req.body;

		const newUser = await register({
			email,
			password,
			last_name,
			first_name,
			profession,
		});

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
		const result = await login(email, password);

		res.json({ data: result });
	} catch (error) {
		res.status(error.status || 500);
		res.json({ message: error?.message || "Internal server Error!" });
	}
};

export const handleChangePassword = async (req, res) => {
	const { currentPassword, newPassword } = req.body;
	const userId = req.user._id;

	if (!userId) {
		throw new ErrorAndStatus("Check required data", 400);
	}

	try {
		const result = await changePassword({
			currentPassword,
			newPassword,
			userId,
		});

		console.log(result);

		res.status(200).json({ data: result });
	} catch (error) {
		res
			.status(error.status || 500)
			.json({ message: error.message || "Internal server error!" });
	}
};
