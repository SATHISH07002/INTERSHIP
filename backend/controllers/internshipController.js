import asyncHandler from "../middleware/asyncHandler.js";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";
import User from "../models/User.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import { approvalStatusTemplate, companySubmissionTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  generateCertificateId,
  generateVerificationId
} from "../utils/generateCertificateId.js";
import generateQrCode from "../utils/qrGenerator.js";
import generateCertificatePdf from "../utils/certificateGenerator.js";
import { generateVerificationId as generatePublicVerificationId } from "../utils/verificationHelpers.js";

const buildInternshipQuery = (user) => {
  if (user.role === "student") {
    return { student: user._id };
  }

  if (user.role === "college") {
    return { college: user._id };
  }

  return { companyUser: user._id };
};

const populateInternship = (query) =>
  query
    .populate(
      "student",
      "fullName email phone rollNo registerNo degree branch department collegeName academicYear section skills areaOfInterest"
    )
    .populate("college", "fullName email")
    .populate("companyUser", "fullName email")
    .populate("company", "name logo");

export const submitInternship = asyncHandler(async (req, res) => {
  const {
    draftId,
    companyId,
    role,
    duration,
    stipend,
    internshipMode,
    startDate,
    endDate,
    weeklyHours,
    workLocation,
    companyEmail,
    mentorName,
    mentorEmail,
    mentorPhone,
    projectTitle,
    projectDomain,
    responsibilities,
    learningGoals,
    techStack,
    saveAsDraft
  } = req.body;

  const isDraft = saveAsDraft === true || saveAsDraft === "true";

  if (
    !isDraft &&
    (!companyId || !role || !duration || !companyEmail || !mentorName || !mentorEmail || !projectTitle)
  ) {
    const error = new Error("Missing required internship details");
    error.statusCode = 400;
    throw error;
  }

  let company = null;
  if (companyId) {
    company = await Company.findById(companyId).populate("owner", "fullName email");
  }

  if (!isDraft && !company) {
    const error = new Error("Selected company does not exist");
    error.statusCode = 404;
    throw error;
  }

  const report = await uploadToCloudinary(req.file, "certitrust/reports", "raw");
  const college = req.user.collegeName
    ? await User.findOne({
        role: "college",
        collegeName: req.user.collegeName
      })
    : null;

  let internship = null;
  if (draftId) {
    internship = await Internship.findOne({
      _id: draftId,
      student: req.user._id
    });

    if (!internship) {
      const error = new Error("Draft internship not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (!isDraft && !req.file && !internship?.rawReport?.url) {
    const error = new Error("Internship report file is required");
    error.statusCode = 400;
    throw error;
  }

  const existingDuplicate =
    company?._id && role && startDate && endDate
      ? await Internship.findOne({
          ...(internship ? { _id: { $ne: internship._id } } : {}),
          student: req.user._id,
          company: company._id,
          role,
          startDate,
          endDate,
          status: { $ne: "draft" }
        })
      : null;

  const duplicateDetected = Boolean(existingDuplicate);

  if (!isDraft && duplicateDetected) {
    const error = new Error("This internship report has already been submitted.");
    error.statusCode = 409;
    throw error;
  }

  const companyVerificationEmail = companyEmail || company?.verificationEmail || company?.contactEmail;
  const companyEmailDomain = companyVerificationEmail?.split("@")[1]?.toLowerCase();
  const companyDomainValid =
    !company?.officialDomains?.length ||
    company.officialDomains.some((domain) => domain.toLowerCase() === companyEmailDomain);
  const fraudFlags = [];

  if (duplicateDetected) {
    fraudFlags.push("duplicate_internship_submission");
  }

  if (companyVerificationEmail && !companyDomainValid) {
    fraudFlags.push("company_email_domain_mismatch");
  }

  if (!college && !isDraft) {
    fraudFlags.push("college_approver_missing");
  }

  const nextStatus = isDraft ? "draft" : "submitted";

  if (!internship) {
    internship = new Internship({
      student: req.user._id,
      verificationId: generatePublicVerificationId()
    });
  }

  internship.college = college?._id || null;
  internship.companyUser = company?.owner?._id || null;
  internship.company = company?._id || null;
  internship.role = role || "";
  internship.duration = duration || "";
  internship.stipend = stipend;
  internship.internshipMode = internshipMode;
  internship.startDate = startDate;
  internship.endDate = endDate;
  internship.weeklyHours = weeklyHours;
  internship.workLocation = workLocation;
  internship.companyEmail = companyVerificationEmail;
  internship.mentorName = mentorName;
  internship.mentorEmail = mentorEmail;
  internship.mentorPhone = mentorPhone;
  internship.projectTitle = projectTitle;
  internship.projectDomain = projectDomain;
  internship.responsibilities = responsibilities;
  internship.learningGoals = learningGoals;
  internship.techStack = techStack;
  internship.rawReport = report || internship.rawReport;
  internship.mentorVerification = {
    status: "pending",
    email: mentorEmail
  };
  internship.companyVerification = {
    status: "pending",
    email: companyVerificationEmail
  };
  internship.companyDomainValid = companyDomainValid;
  internship.duplicateDetected = duplicateDetected;
  internship.fraudFlags = fraudFlags;
  internship.status = nextStatus;

  if (!isDraft) {
    internship.collegeApproval = { approved: null, reason: "", actedAt: null, actedBy: null };
    internship.companyApproval = { approved: null, reason: "", actedAt: null, actedBy: null };
    internship.certificate = undefined;
  }

  await internship.save();

  res.status(201).json({
    success: true,
    data: await populateInternship(Internship.findById(internship._id))
  });

  if (!isDraft && companyVerificationEmail) {
    await sendEmail({
      to: companyVerificationEmail,
      subject: "New internship report submitted in CertiTrust",
      html: companySubmissionTemplate({
        companyName: company?.name,
        studentName: req.user.fullName,
        studentCollege: req.user.collegeName,
        internshipRole: role,
        duration,
        startDate,
        endDate,
        mentorName,
        projectTitle,
        reportUrl: report?.url
      })
    });
  }
});

export const getInternships = asyncHandler(async (req, res) => {
  const internships = await populateInternship(
    Internship.find(buildInternshipQuery(req.user)).sort({ createdAt: -1 })
  );

  res.json({
    success: true,
    data: internships
  });
});

export const getPendingApprovals = asyncHandler(async (req, res) => {
  const key = req.user.role === "college" ? "collegeApproval.approved" : "companyApproval.approved";
  const pending = await populateInternship(
    Internship.find({
      ...buildInternshipQuery(req.user),
      status: { $ne: "draft" },
      [key]: null
    }).sort({ createdAt: -1 })
  );

  res.json({
    success: true,
    data: pending
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { approved, reason } = req.body;
  const internship = await populateInternship(Internship.findById(req.params.id));

  if (!internship) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  const reviewerKey = req.user.role === "college" ? "collegeApproval" : "companyApproval";
  const ownsSubmission =
    (req.user.role === "college" && internship.college?._id?.toString() === req.user._id.toString()) ||
    (req.user.role === "company" && internship.companyUser?._id?.toString() === req.user._id.toString());

  if (!ownsSubmission) {
    const error = new Error("You cannot update this submission");
    error.statusCode = 403;
    throw error;
  }

  if (approved === false && !reason?.trim()) {
    const error = new Error("A rejection reason is required");
    error.statusCode = 400;
    throw error;
  }

  if (!internship.collegeApproval) {
    internship.collegeApproval = { approved: null, reason: "", actedAt: null, actedBy: null };
  }

  if (!internship.companyApproval) {
    internship.companyApproval = { approved: null, reason: "", actedAt: null, actedBy: null };
  }

  internship[reviewerKey] = {
    approved,
    reason: approved ? "" : reason,
    actedAt: new Date(),
    actedBy: req.user._id
  };

  if (approved === false) {
    internship.status = "resubmission_required";
  } else if (
    internship.collegeApproval.approved === true &&
    internship.companyApproval.approved === true
  ) {
    internship.status = "approved";
    if (!internship.certificate?.certificateId) {
      await generateCertificate(internship);
    }
  } else if (internship.collegeApproval.approved === true) {
    internship.status = "company_pending";
  } else if (internship.companyApproval.approved === true) {
    internship.status = "college_pending";
  } else {
    internship.status = "submitted";
  }

  await internship.save();

  res.json({
    success: true,
    data: await populateInternship(Internship.findById(internship._id))
  });

  try {
    await sendEmail({
      to: internship.student.email,
      subject: "CertiTrust status updated",
      html: approvalStatusTemplate({
        studentName: internship.student.fullName,
        internshipRole: internship.role,
        reviewerRole: req.user.role,
        approved,
        reason
      })
    });
  } catch (emailError) {
    console.error("Failed to send internship status email:", emailError.message);
  }
});

export const editAndResubmitInternship = asyncHandler(async (req, res) => {
  const {
    companyId,
    role,
    duration,
    stipend,
    internshipMode,
    startDate,
    endDate,
    weeklyHours,
    workLocation,
    companyEmail,
    mentorName,
    mentorEmail,
    mentorPhone,
    projectTitle,
    projectDomain,
    responsibilities,
    learningGoals,
    techStack
  } = req.body;

  const internship = await Internship.findOne({
    _id: req.params.id,
    student: req.user._id
  });

  if (!internship) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  if (internship.status === "approved") {
    const error = new Error("Approved internship records can no longer be edited");
    error.statusCode = 400;
    throw error;
  }

  if (!req.file && !internship.rawReport?.url) {
    const error = new Error("Internship report file is required");
    error.statusCode = 400;
    throw error;
  }

  const company = companyId
    ? await Company.findById(companyId).populate("owner", "fullName email")
    : internship.company
      ? await Company.findById(internship.company).populate("owner", "fullName email")
      : null;

  if (!company) {
    const error = new Error("Selected company does not exist");
    error.statusCode = 404;
    throw error;
  }

  const college = req.user.collegeName
    ? await User.findOne({
        role: "college",
        collegeName: req.user.collegeName
      })
    : null;

  const nextRole = role || internship.role;
  const nextStartDate = startDate || internship.startDate;
  const nextEndDate = endDate || internship.endDate;
  const nextCompanyEmail = companyEmail || company?.verificationEmail || company?.contactEmail;

  const existingDuplicate =
    company?._id && nextRole && nextStartDate && nextEndDate
      ? await Internship.findOne({
          _id: { $ne: internship._id },
          student: req.user._id,
          company: company._id,
          role: nextRole,
          startDate: nextStartDate,
          endDate: nextEndDate,
          status: { $ne: "draft" }
        })
      : null;

  const duplicateDetected = Boolean(existingDuplicate);

  if (duplicateDetected) {
    const error = new Error("This internship report has already been submitted.");
    error.statusCode = 409;
    throw error;
  }

  const companyEmailDomain = nextCompanyEmail?.split("@")[1]?.toLowerCase();
  const companyDomainValid =
    !company?.officialDomains?.length ||
    company.officialDomains.some((domain) => domain.toLowerCase() === companyEmailDomain);
  const fraudFlags = [];

  if (duplicateDetected) {
    fraudFlags.push("duplicate_internship_submission");
  }

  if (nextCompanyEmail && !companyDomainValid) {
    fraudFlags.push("company_email_domain_mismatch");
  }

  if (!college) {
    fraudFlags.push("college_approver_missing");
  }

  internship.college = college?._id || null;
  internship.companyUser = company?.owner?._id || null;
  internship.company = company?._id || null;
  internship.role = nextRole;
  internship.duration = duration || internship.duration;
  internship.stipend = stipend || internship.stipend;
  internship.internshipMode = internshipMode || internship.internshipMode;
  internship.startDate = nextStartDate;
  internship.endDate = nextEndDate;
  internship.weeklyHours = weeklyHours || internship.weeklyHours;
  internship.workLocation = workLocation || internship.workLocation;
  internship.companyEmail = nextCompanyEmail;
  internship.mentorName = mentorName || internship.mentorName;
  internship.mentorEmail = mentorEmail || internship.mentorEmail;
  internship.mentorPhone = mentorPhone || internship.mentorPhone;
  internship.projectTitle = projectTitle || internship.projectTitle;
  internship.projectDomain = projectDomain || internship.projectDomain;
  internship.responsibilities = responsibilities || internship.responsibilities;
  internship.learningGoals = learningGoals || internship.learningGoals;
  internship.techStack = techStack || internship.techStack;
  internship.mentorVerification = {
    status: "pending",
    email: mentorEmail || internship.mentorEmail
  };
  internship.companyVerification = {
    status: "pending",
    email: nextCompanyEmail
  };
  internship.companyDomainValid = companyDomainValid;
  internship.duplicateDetected = duplicateDetected;
  internship.fraudFlags = fraudFlags;

  if (req.file) {
    internship.rawReport = await uploadToCloudinary(req.file, "certitrust/reports", "raw");
  }

  internship.status = "submitted";
  internship.collegeApproval = { approved: null, reason: "", actedAt: null, actedBy: null };
  internship.companyApproval = { approved: null, reason: "", actedAt: null, actedBy: null };
  internship.certificate = undefined;
  await internship.save();

  res.json({
    success: true,
    data: await populateInternship(Internship.findById(internship._id))
  });
});

export const generateCertificate = async (internshipDocument) => {
  const internship = internshipDocument.populate
    ? await internshipDocument.populate([
        {
          path: "student",
          select:
            "fullName email phone rollNo registerNo degree branch department collegeName academicYear section skills areaOfInterest"
        },
        { path: "college", select: "fullName email" },
        { path: "company", select: "name logo" }
      ])
    : internshipDocument;

  const verificationId = generateVerificationId();
  const certificateId = generateCertificateId();
  const verificationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify/${verificationId}`;

  internship.certificate = {
    certificateId,
    verificationId,
    generatedAt: new Date()
  };

  const qrCodeDataUrl = await generateQrCode(verificationUrl);
  const pdfBuffer = await generateCertificatePdf({
    internship,
    verificationUrl,
    qrCodeDataUrl
  });

  const pdfUpload = await uploadToCloudinary(
    {
      buffer: pdfBuffer,
      mimetype: "application/pdf",
      originalname: `${certificateId}.pdf`
    },
    "certitrust/certificates",
    "raw"
  );

  internship.certificate = {
    ...internship.certificate,
    url: pdfUpload?.url,
    publicId: pdfUpload?.publicId
  };
};
