import mongoose from "mongoose";

const postSchema = mongoose.Schema(
	{
		title: {
			type: String,
			trim: true,
			required: true,
		},
		description: {
			type: String,
			trim: true,
			required: true,
		},
		tags: {
			type: [String],
			default: [],
		},
		image: {
			type: String,
			trim: true,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Posts = mongoose.model("post", postSchema);

export default Posts;
