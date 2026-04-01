import asyncHandler from "../middleware/asyncHandler.js";
import Document from "../models/Document.js";
import Internship from "../models/Internship.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";

export const uploadInternshipDocument = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);

  if (!internship) {
    const error = new Error("Internship not found");
    error.statusCode = 404;
    throw error;
  }

  if (req.user.role === "student" && internship.student.toString() !== req.user._id.toString()) {
    const error = new Error("You cannot upload documents for this internship");
    error.statusCode = 403;
    throw error;
  }

  const fileUpload = await uploadToCloudinary(req.file, "certitrust/documents", "auto");
  const document = await Document.create({
    internship: internship._id,
    type: req.body.type || "supporting_document",
    fileName: fileUpload?.originalName || req.file?.originalname,
    fileUrl: fileUpload?.url,
    publicId: fileUpload?.publicId,
    mimeType: req.file?.mimetype,
    size: req.file?.size,
    uploadedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: document
  });
});

export const getInternshipDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ internship: req.params.id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: documents
  });
});
