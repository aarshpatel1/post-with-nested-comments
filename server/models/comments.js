import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
	{
		postId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "post",
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
			required: true,
		},
		commentBody: {
			type: String,
			required: true,
		},
		replies: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "comment",
		},
	},
	{
		timestamps: true,
	}
);

const Comments = mongoose.model("comment", commentSchema);

export default commentSchema;
