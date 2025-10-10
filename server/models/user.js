import mongoose from "mongoose";

const userSchema = mongoose.Schema(
	{
		firstName: {
			type: String,
			trim: true,
			required: true,
		},
		lastName: {
			type: String,
			trim: true,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			trim: true,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		profilePhoto: {
			type: String,
			trim: true,
		},
	},
	{
		timestaps: true,
	}
);

const Users = mongoose.model("user", userSchema);

export default Users;
