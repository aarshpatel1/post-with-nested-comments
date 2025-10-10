import { toTitleCase, validateFields } from "../utils/customValidator.js";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt";
import Users from "../models/user.js";
import { generateJwt } from "../utils/tokenGenerator.js";

configDotenv({ quiet: true });

const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);

export const signup = async (req, res) => {
	try {
		if (!req.body) {
			return res.status(400).json({
				status: "error",
				message: "No request body..!!",
			});
		}

		let { firstName, lastName, email, password, profilePhoto } = req.body;

		const fields = [
			{ name: "First Name", value: firstName },
			{ name: "Last Name", value: lastName },
			{ name: "Email", value: email },
			{ name: "Password", value: password },
		];

		const validationResult = validateFields(fields);
		if (validationResult !== true) {
			return res.status(400).json(validationResult);
		}

		const isExists = await Users.findOne({ email });
		if (isExists) {
			return res.status(409).json({
				status: "error",
				message: "User already registered with this email..!!",
			});
		}

		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const record = {
			firstName: toTitleCase(firstName),
			lastName: toTitleCase(lastName),
			email,
			password: hashedPassword,
			profilePhoto:
				"https://api.dicebear.com/9.x/initials/svg?seed=" +
				`${firstName}%20${lastName}`,
		};

		const signupUser = await Users.create(record);

		return res.status(201).json({
			status: "success",
			message: "User signed up successfully..!!",
			user: signupUser,
		});
	} catch (error) {
		console.error("Signup error:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error..!!",
		});
	}
};

export const login = async (req, res) => {
	try {
		if (!req.body) {
			return res.status(400).json({
				status: "error",
				message: "No request body..!!",
			});
		}

		let { email, password } = req.body;

		const fields = [
			{ name: "Email", value: email },
			{ name: "Password", value: password },
		];

		const validationResult = validateFields(fields);
		if (validationResult !== true) {
			return res.status(400).json(validationResult);
		}

		const isExists = await Users.findOne({ email });
		if (!isExists) {
			return res.status(409).json({
				status: "error",
				field: "email",
				message: "Invalid Email Address..!!",
			});
		}

		const isPasswordValid = await bcrypt.compare(
			password,
			isExists.password
		);

		if (!isPasswordValid) {
			return res.status(409).json({
				status: "error",
				field: "password",
				message: "Invalid Password..!!",
			});
		}

		const token = generateJwt(isExists._id);

		return res.status(200).json({
			status: "success",
			userId: isExists._id,
			token,
		});
	} catch (error) {
		console.error("Login error:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error..!!",
		});
	}
};
