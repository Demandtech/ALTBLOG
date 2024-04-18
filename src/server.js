import mongoose from "mongoose";
import app from './index.js';

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;

mongoose.connect(MONGO_URL).then(() => {
	try {
		console.log("Connected to DB");

		app.listen(PORT, () => {
			console.log("Server is running on PORT: ", PORT);
		});
	} catch (error) {
		console.log("Error connecting to MongoDB: ", error.message);
	}
});
