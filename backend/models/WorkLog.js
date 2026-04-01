import mongoose from "mongoose";

const workLogSchema = new mongoose.Schema(
  {
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    hoursWorked: {
      type: Number,
      required: true
    },
    tasks: {
      type: String,
      required: true
    },
    proofUrl: String,
    proofPublicId: String,
    reviewStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    mentorRemarks: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model("WorkLog", workLogSchema);
