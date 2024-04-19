import UserModel from "../databases/models/user.model.js";

const getAuthorsByName = async (searchQuery) => {
	const regexQuery = new RegExp(searchQuery, "i");

	const authors = await UserModel.find({
		$or: [{ first_name: regexQuery }, { last_name: regexQuery }],
	});

	return authors.map((author) => author._id);
};
export default getAuthorsByName;
