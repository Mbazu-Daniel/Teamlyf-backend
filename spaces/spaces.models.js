import mongoose from "mongoose";

const spaceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
  },

  { timestamps: true }
);

const Project = mongoose.model("Space", spaceSchema);
export default Project;
