import { googleUrl, getGoogleToken } from "../services/0auth.service.js";

export const handleGoogleUrl = (req, res) => {
	try {
		const url = googleUrl();
		res.json({ message: "Google authorization URL generated", url });
	} catch (error) {
		res
			.status(error.status || 500)
			.json({ message: error.message || "Internal server error" });
	}
};
export const handleGoogleToken = async (req, res) => {
	const { code } = req.query;

	try {
		const result = await getGoogleToken(code);
		res.json({ data: result });
	} catch (error) {
		res
			.status(error.status || 500)
			.json({ message: error.message || "Internal server error" });
	}
};
