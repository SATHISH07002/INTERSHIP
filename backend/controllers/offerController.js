import asyncHandler from "../middleware/asyncHandler.js";
import Company from "../models/Company.js";
import JobOffer from "../models/JobOffer.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { offerPublishedTemplate } from "../utils/emailTemplates.js";

export const createOffer = asyncHandler(async (req, res) => {
  const {
    title,
    type,
    location,
    stipend,
    description,
    applicationStartDate,
    applicationEndDate
  } = req.body;

  if (!title || !description || !applicationStartDate || !applicationEndDate) {
    const error = new Error("Title, description, application start date, and application end date are required");
    error.statusCode = 400;
    throw error;
  }

  if (new Date(`${applicationEndDate}T23:59:59`) < new Date(`${applicationStartDate}T00:00:00`)) {
    const error = new Error("Application end date must be after the start date");
    error.statusCode = 400;
    throw error;
  }

  let company = await Company.findOne({ owner: req.user._id });

  if (!company) {
    company = await Company.create({
      owner: req.user._id,
      name: req.user.companyName?.trim() || req.user.fullName,
      contactEmail: req.user.email
    });
  }

  const offer = await JobOffer.create({
    company: company._id,
    postedBy: req.user._id,
    title,
    type,
    location,
    stipend,
    description,
    applicationStartDate,
    applicationEndDate
  });

  res.status(201).json({
    success: true,
    data: offer
  });

  try {
    const recipients = await User.find({
      role: { $in: ["student", "college"] }
    }).select("fullName email");

    await Promise.all(
      recipients.map((recipient) =>
        sendEmail({
          to: recipient.email,
          subject: `New ${type === "job" ? "job" : "internship"} offer on CertiTrust`,
          html: offerPublishedTemplate({
            recipientName: recipient.fullName,
            companyName: company.name,
            title,
            type,
            location,
            stipend,
            description
          })
        })
      )
    );
  } catch (emailError) {
    console.error("Failed to send offer notifications:", emailError.message);
  }
});

export const getOffers = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user?.role === "company") {
    const company = await Company.findOne({ owner: req.user._id }).select("_id");
    query = company ? { company: company._id } : { _id: null };
  }

  const offers = await JobOffer.find(query)
    .populate("company", "name logo")
    .populate("postedBy", "fullName email")
    .populate("applications.student", "fullName email rollNo registerNo department degree branch collegeName phone")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: offers
  });
});

export const closeOffer = asyncHandler(async (req, res) => {
  const offer = await JobOffer.findById(req.params.id);

  if (!offer) {
    const error = new Error("Offer not found");
    error.statusCode = 404;
    throw error;
  }

  if (offer.postedBy.toString() !== req.user._id.toString()) {
    const error = new Error("You cannot close this offer");
    error.statusCode = 403;
    throw error;
  }

  const updatedOffer = await JobOffer.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        isClosed: true,
        closedAt: new Date()
      }
    },
    {
      new: true,
      runValidators: false
    }
  );

  res.json({
    success: true,
    data: updatedOffer
  });
});

export const applyToOffer = asyncHandler(async (req, res) => {
  const offer = await JobOffer.findById(req.params.id);

  if (!offer) {
    const error = new Error("Offer not found");
    error.statusCode = 404;
    throw error;
  }

  if (offer.isClosed) {
    const error = new Error("This offer has been closed by the company");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  const applicationStart = new Date(`${offer.applicationStartDate}T00:00:00`);
  const applicationEnd = new Date(`${offer.applicationEndDate}T23:59:59`);

  if (now < applicationStart) {
    const error = new Error("Applications are not open yet for this offer");
    error.statusCode = 400;
    throw error;
  }

  if (now > applicationEnd) {
    const error = new Error("This offer has expired");
    error.statusCode = 400;
    throw error;
  }

  const alreadyApplied = offer.applications.some(
    (application) => application.student.toString() === req.user._id.toString()
  );

  if (!alreadyApplied) {
    offer.applications.push({ student: req.user._id });
    await offer.save();
  }

  res.json({
    success: true,
    message: alreadyApplied ? "Already applied" : "Application submitted",
    data: offer
  });
});
