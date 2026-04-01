import asyncHandler from "../middleware/asyncHandler.js";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";
import User from "../models/User.js";
import { generateCertificate } from "./internshipController.js";

export const getAdminInternships = asyncHandler(async (_req, res) => {
  const internships = await Internship.find()
    .populate("student", "fullName email collegeName")
    .populate("company", "name officialDomains")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: internships
  });
});

export const decideInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  const approved = req.body.approved === true || req.body.approved === "true";
  const reason = req.body.reason || "";

  internship.adminReview = {
    status: approved ? "verified" : "rejected",
    reviewedBy: req.user._id,
    reviewedAt: new Date(),
    reason
  };
  internship.status = approved ? "approved" : "rejected";

  if (approved && !internship.certificate?.certificateId) {
    await generateCertificate(internship);
  }

  await internship.save();

  res.json({
    success: true,
    data: internship
  });
});

export const getAdminUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.json({
    success: true,
    data: users
  });
});

export const updateCompanyDomains = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);

  if (!company) {
    const error = new Error("Company not found");
    error.statusCode = 404;
    throw error;
  }

  company.officialDomains = Array.isArray(req.body.officialDomains) ? req.body.officialDomains : company.officialDomains;
  if (req.body.verificationEmail !== undefined) {
    company.verificationEmail = req.body.verificationEmail;
  }
  await company.save();

  res.json({
    success: true,
    data: company
  });
});
