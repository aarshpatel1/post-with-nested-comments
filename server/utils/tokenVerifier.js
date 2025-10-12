import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";

configDotenv({
	quiet: true,
});

export const verifyToken = (token) => {
	return jwt.verify(token, process.env.JWT_SECRET);
};

