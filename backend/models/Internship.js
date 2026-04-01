import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema(
  {
    approved: {
      type: Boolean,
      default: null
    },
    reason: {
      type: String,
      default: ""
    },
    actedAt: Date,
    actedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    email: String,
    otp: String,
    token: String,
    reason: String,
    verifiedAt: Date
  },
  { _id: false }
);

const internshipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    companyUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null
    },
    role: {
      type: String,
      default: ""
    },
    duration: {
      type: String,
      default: ""
    },
    stipend: {
      type: String,
      default: "Unpaid"
    },
    internshipMode: String,
    startDate: String,
    endDate: String,
    weeklyHours: String,
    workLocation: String,
    companyEmail: String,
    mentorName: String,
    mentorEmail: String,
    mentorPhone: String,
    projectTitle: String,
    projectDomain: String,
    responsibilities: String,
    learningGoals: String,
    techStack: String,
    rawReport: {
      url: String,
      publicId: String,
      originalName: String
    },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "college_pending",
        "mentor_pending",
        "mentor_verified",
        "company_pending",
        "company_verified",
        "admin_pending",
        "approved",
        "rejected",
        "resubmission_required",
        "flagged"
      ],
      default: "submitted"
    },
    verificationId: {
      type: String,
      unique: true,
      sparse: true
    },
    mentorVerification: verificationSchema,
    companyVerification: verificationSchema,
    adminReview: {
      status: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      reviewedAt: Date,
      reason: String
    },
    companyDomainValid: {
      type: Boolean,
      default: false
    },
    duplicateDetected: {
      type: Boolean,
      default: false
    },
    fraudFlags: [String],
    collegeApproval: approvalSchema,
    companyApproval: approvalSchema,
    certificate: {
      certificateId: String,
      verificationId: String,
      url: String,
      publicId: String,
      generatedAt: Date
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Internship", internshipSchema);
