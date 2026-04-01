import asyncHandler from "../middleware/asyncHandler.js";
import Internship from "../models/Internship.js";

export const verifyCertificate = asyncHandler(async (req, res) => {
  const internship = await Internship.findOne({
    $or: [{ "certificate.verificationId": req.params.id }, { verificationId: req.params.id }]
  })
    .populate("student", "fullName rollNo registerNo degree branch department collegeName academicYear")
    .populate("college", "fullName email")
    .populate("company", "name logo")
    .select(
      "role duration stipend status certificate verificationId internshipMode startDate endDate projectTitle mentorVerification companyVerification adminReview companyDomainValid duplicateDetected fraudFlags createdAt student college company"
    );

  if (!internship) {
    const error = new Error("Certificate not found");
    error.statusCode = 404;
    throw error;
  }

  res.json({
    success: true,
    data: internship
  });
});
