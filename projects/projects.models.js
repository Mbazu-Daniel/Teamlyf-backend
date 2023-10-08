import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
    },
    description: {
      type: String,
    },

    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        index: true,
      },
    ],
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "folder",
      required: true,
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

const Project = mongoose.model("Project", projectSchema);
export default Project;
