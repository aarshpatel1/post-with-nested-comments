export const validateFields = (fields) => {
	console.log(fields);

	for (let field of fields) {
		console.log(field);
		if (!field.value) {
			return {
				status: "error",
				field: field.name,
				message: `${field.name} is required..!!`,
			};
		}
	}
	return true;
};

export const toTitleCase = (str) => {
	if (!str) {
		return "";
	}
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
};
