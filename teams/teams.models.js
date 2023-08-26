import mongoose from "mongoose";

const TeamsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employees: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    ],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);
const Team = mongoose.model("Team", TeamsSchema);
export default Team;
