import mongoose from "mongoose";

const spaceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true,
      },
    ],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
  },
  { versionKey: false },
  { timestamps: true }
);

const Space = mongoose.model("Space", spaceSchema);
export default Space;
