import mongoose from "mongoose";

const taskSchema = mongoose.schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "Employee",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["critical", "minor", "normal", "major"],
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
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        index: true,
      },
    ],
    isCompleted: { type: Boolean, default: false, index: true },
    dueDate: { type: Date, index: true },
    reminderDate: { type: Date, index: true },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
export default Task;
