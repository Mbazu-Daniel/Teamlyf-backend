import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthDate: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Others"], index: true },
    contactNumber: { type: String },
    address: { type: String },
    image: { type: String },
    salary: { type: Number },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    role: {
      type: String,
      enum: ["Owner", "Admin", "Member"],
      default: "Member",
    },
  },
  { versionKey: false },
  { timestamps: true }
);
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
