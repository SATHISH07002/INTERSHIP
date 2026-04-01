import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true
    },
    type: {
      type: String,
      enum: ["offer_letter", "completion_certificate", "supporting_document", "activity_proof", "report"],
      required: true
    },
    fileName: String,
    fileUrl: String,
    publicId: String,
    mimeType: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    scanStatus: {
      type: String,
      enum: ["pending", "safe", "flagged"],
      default: "safe"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Document", documentSchema);
