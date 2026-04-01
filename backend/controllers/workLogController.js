import asyncHandler from "../middleware/asyncHandler.js";
import Internship from "../models/Internship.js";
import WorkLog from "../models/WorkLog.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";

export const createWorkLog = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);

  if (!internship || internship.student.toString() !== req.user._id.toString()) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  const proofUpload = await uploadToCloudinary(req.file, "certitrust/activity", "auto");
  const log = await WorkLog.create({
    internship: internship._id,
    student: req.user._id,
    date: req.body.date,
    hoursWorked: Number(req.body.hoursWorked),
    tasks: req.body.tasks,
    proofUrl: proofUpload?.url,
    proofPublicId: proofUpload?.publicId
  });

  res.status(201).json({
    success: true,
    data: log
  });
});

export const getWorkLogs = asyncHandler(async (req, res) => {
  const logs = await WorkLog.find({ internship: req.params.id }).sort({ date: -1, createdAt: -1 });

  res.json({
    success: true,
    data: logs
  });
});

export const reviewWorkLog = asyncHandler(async (req, res) => {
  const log = await WorkLog.findById(req.params.logId).populate("internship");

  if (!log) {
    const error = new Error("Work log not found");
    error.statusCode = 404;
    throw error;
  }

  const internship = log.internship;
  const canReview =
    req.user.role === "admin" ||
    req.user.role === "mentor" ||
    (req.user.role === "company" && internship.companyUser.toString() === req.user._id.toString()) ||
    (req.user.role === "college" && internship.college.toString() === req.user._id.toString());

  if (!canReview) {
    const error = new Error("You cannot review this work log");
    error.statusCode = 403;
    throw error;
  }

  log.reviewStatus = req.body.reviewStatus || log.reviewStatus;
  log.mentorRemarks = req.body.mentorRemarks || "";
  await log.save();

  res.json({
    success: true,
    data: log
  });
});
