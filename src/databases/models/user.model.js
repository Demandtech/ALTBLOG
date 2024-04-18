import mongoose from "mongoose";
import userSchema from "../schemas/user.schema.js";

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
