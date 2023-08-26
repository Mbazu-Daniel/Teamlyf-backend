import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String },
    password: { type: String },
    birthDate: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Others"] },
    contactNumber: { type: String },
    address: { type: String },
    image: { type: String },
    salary: { type: Number },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  },
  { timestamps: true }
);
const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
