import mongoose from "mongoose";

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "Employee",
    },

    priority: {
      type: String,
      enum: ["critical", "minor", "normal", "major"],
      default: "normal",
      //   enum: ["urgent", "low", "medium", "high"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "advancing", "concluded"],
      default: "pending",
      index: true,
    },
    tags: {
      type: [String],
      lowercase: true,
      index: true,
    },

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true,
      },
    ],
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        index: true,
      },
    ],

    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: false,
      },
    ],
    isCompleted: { type: Boolean, default: false, index: true },
    startDate: { type: Date, index: true },
    dueDate: { type: Date, index: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
  },
  { versionKey: false },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
