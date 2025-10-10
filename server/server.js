import db from "./config/db.js";

import express from "express";
import { configDotenv } from "dotenv";
import router from "./routes/index.js";

configDotenv({
	quiet: true,
});

const port = process.env.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.listen(port, (err) =>
	err
		? console.log("Error starting server..!", err)
		: console.log("Server is running on http://127.0.0.1:" + port)
);
