import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String },
    logo: { type: String },
    size: { type: String },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
export default mongoose.model("Organization", organizationSchema);
