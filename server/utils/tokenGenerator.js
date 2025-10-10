import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

configDotenv({
	quiet: true,
});

export const generateJwt = (userId) => {
	return jwt.sign(
		{
			id: userId,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRY,
		}
	);
};
