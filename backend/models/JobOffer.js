import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const jobOfferSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["internship", "job"],
      default: "internship"
    },
    location: String,
    stipend: String,
    applicationStartDate: {
      type: String,
      required: true
    },
    applicationEndDate: {
      type: String,
      required: true
    },
    isClosed: {
      type: Boolean,
      default: false
    },
    closedAt: Date,
    description: {
      type: String,
      required: true
    },
    applications: [applicationSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.model("JobOffer", jobOfferSchema);
