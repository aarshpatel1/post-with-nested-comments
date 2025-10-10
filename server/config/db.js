import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv({
	quiet: true,
});

mongoose.connect(process.env.MONGO_URI + "posts");

const db = mongoose.connection;

db.once("open", (err) => {
	if (err) {
		console.log("Error connecting MongoDB..!!");
	}
	console.log("MongoDB connected successfully..!!");
});

export default db;
