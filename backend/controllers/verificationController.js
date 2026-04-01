import asyncHandler from "../middleware/asyncHandler.js";
import Internship from "../models/Internship.js";
import Company from "../models/Company.js";
import { generateApprovalToken, generateOtp } from "../utils/verificationHelpers.js";

const publicSelect =
  "role duration stipend internshipMode startDate endDate weeklyHours workLocation projectTitle projectDomain responsibilities learningGoals techStack status verificationId certificate mentorVerification companyVerification adminReview companyDomainValid duplicateDetected fraudFlags createdAt student company";

const getInternshipForPublicView = (verificationId) =>
  Internship.findOne({ verificationId })
    .populate("student", "fullName rollNo registerNo degree branch department collegeName academicYear")
    .populate("company", "name website")
    .select(publicSelect);

export const sendMentorOtp = asyncHandler(async (req, res) => {
  const internship = await Internship.findOne({
    _id: req.params.id,
    student: req.user._id
  });

  if (!internship) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  const { mentorEmail } = req.body;
  const otp = generateOtp();

  internship.mentorVerification = {
    ...internship.mentorVerification,
    status: "pending",
    email: mentorEmail || internship.mentorEmail,
    otp,
    reason: "",
    verifiedAt: null
  };
  internship.status = "mentor_pending";
  await internship.save();

  res.json({
    success: true,
    data: {
      mentorEmail: internship.mentorVerification.email,
      otpPreview: otp,
      message: "Mentor verification OTP generated"
    }
  });
});

export const verifyMentorOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  if (!internship.mentorVerification?.otp || internship.mentorVerification.otp !== otp) {
    const error = new Error("Invalid mentor OTP");
    error.statusCode = 400;
    throw error;
  }

  internship.mentorVerification = {
    ...internship.mentorVerification,
    status: "verified",
    verifiedAt: new Date(),
    otp: undefined
  };
  internship.status = "company_pending";
  await internship.save();

  res.json({
    success: true,
    data: internship
  });
});

export const sendCompanyApprovalLink = asyncHandler(async (req, res) => {
  const internship = await Internship.findOne({
    _id: req.params.id,
    student: req.user._id
  }).populate("company", "name officialDomains contactEmail verificationEmail");

  if (!internship) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  const company = internship.company;
  const verifierEmail = req.body.verifierEmail || company?.verificationEmail || company?.contactEmail;
  const emailDomain = verifierEmail?.split("@")[1]?.toLowerCase() || "";
  const matchedDomain = company?.officialDomains?.some((domain) => domain.toLowerCase() === emailDomain);
  const token = generateApprovalToken();

  internship.companyVerification = {
    ...internship.companyVerification,
    status: "pending",
    email: verifierEmail,
    token,
    reason: "",
    verifiedAt: null
  };
  internship.companyDomainValid = Boolean(matchedDomain);
  internship.status = "company_pending";

  if (!matchedDomain) {
    internship.fraudFlags = [...new Set([...(internship.fraudFlags || []), "company_email_domain_mismatch"])];
    internship.status = "flagged";
  }

  await internship.save();

  res.json({
    success: true,
    data: {
      verifierEmail,
      approvalToken: token,
      companyDomainValid: internship.companyDomainValid
    }
  });
});

export const verifyCompanyApproval = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  if (!internship.companyVerification?.token || internship.companyVerification.token !== token) {
    const error = new Error("Invalid company approval token");
    error.statusCode = 400;
    throw error;
  }

  internship.companyVerification = {
    ...internship.companyVerification,
    status: "verified",
    verifiedAt: new Date(),
    token: undefined
  };
  internship.status = "admin_pending";
  await internship.save();

  res.json({
    success: true,
    data: internship
  });
});

export const getPublicVerification = asyncHandler(async (req, res) => {
  const internship = await getInternshipForPublicView(req.params.verificationId);

  if (!internship) {
    const error = new Error("Verification record not found");
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: internship
  });
});

export const getVerificationInbox = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === "mentor") {
    query = { "mentorVerification.email": { $in: [req.user.email, req.user.organizationEmail].filter(Boolean) } };
  } else if (req.user.role === "company") {
    const company = await Company.findOne({ owner: req.user._id });
    query = company ? { company: company._id } : { _id: null };
  } else if (req.user.role === "admin") {
    query = { status: { $in: ["admin_pending", "flagged"] } };
  }

  const internships = await Internship.find(query)
    .populate("student", "fullName collegeName department")
    .populate("company", "name")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: internships
  });
});
