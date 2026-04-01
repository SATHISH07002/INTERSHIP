import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    logo: {
      url: String,
      publicId: String
    },
    website: String,
    description: String,
    contactEmail: String,
    officialDomains: [String],
    verificationEmail: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Company", companySchema);
