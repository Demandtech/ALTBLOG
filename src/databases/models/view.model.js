import viewSchema from "../schemas/view.schema.js";
import mongoose from "mongoose";

const viewModel = mongoose.model("View", viewSchema);

export default viewModel;
