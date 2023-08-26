import mongoose from "mongoose";

const TeamsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, required: true },
    description: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true }
);
const Team = mongoose.model("Team", TeamsSchema);
export default Team;
