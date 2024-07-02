import "dotenv/config";

const config = {
	clientId: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
	tokenUrl: "https://oauth2.googleapis.com/token",
	redirectUrl: process.env.REDIRECT_URL,
	clientUrl: process.env.CLIENT_URL,
	tokenSecret: process.env.JWT_SECRET,
	// tokenExpiration: 36000,
};
export default config;
