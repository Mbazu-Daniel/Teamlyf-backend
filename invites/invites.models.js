import mongoose from "mongoose";

const inviteSchema = mongoose.Schema(
  {
    token: {
      type: String,
    },

    email: {
      type: String,
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },
    expirationDate: {
      type: Date,
    },
  },
  { versionKey: false },
  { timestamps: true }
);

const Invite = mongoose.model("Invite", inviteSchema);
export default Invite;
