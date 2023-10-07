import mongoose from "mongoose";

const folderSchema = mongoose.Schema(
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
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
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

const folder = mongoose.model("folder", folderSchema);
export default folder;
