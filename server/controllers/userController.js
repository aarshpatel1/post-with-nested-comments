import Users from "../models/user.js";

export const allUsers = async (req, res) => {
	try {
		const users = await Users.find();
		return res.status(200).json({
			status: "success",
			message: "All users fetched successfully..!!",
			users,
		});
	} catch (error) {
		console.error("Error fetching all users:", error);
		return res.status(500).json({
			status: "error",
			message: "Internal Server Error..!!",
		});
	}
};
