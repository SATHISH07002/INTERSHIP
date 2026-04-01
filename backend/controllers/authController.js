import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import generateToken from "../utils/generateToken.js";
import uploadToCloudinary from "../utils/cloudinaryUpload.js";

const ensureCompanyProfile = async (user) => {
  if (user.role !== "company") {
    return null;
  }

  let company = await Company.findOne({ owner: user._id });

  if (!company) {
    company = await Company.create({
      owner: user._id,
      name: user.companyName?.trim() || user.fullName,
      contactEmail: user.email
    });
  }

  return company;
};

export const registerUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    role,
    rollNo,
    degree,
    branch,
    department,
    collegeName,
    companyName,
    phone
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists");
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role,
    rollNo,
    degree,
    branch,
    department,
    collegeName,
    companyName,
    phone
  });

  let company = null;
  if (role === "company") {
    company = await ensureCompanyProfile(user);
  }

  res.status(201).json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        password: undefined
      },
      company,
      token: generateToken(user._id)
    }
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const company = await ensureCompanyProfile(user);

  res.json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        password: undefined
      },
      company,
      token: generateToken(user._id)
    }
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const company = await ensureCompanyProfile(req.user);

  res.json({
    success: true,
    data: {
      user: req.user,
      company
    }
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const editableFields = [
    "fullName",
    "phone",
    "alternatePhone",
    "personalEmail",
    "address",
    "city",
    "state",
    "pincode",
    "rollNo",
    "registerNo",
    "degree",
    "branch",
    "department",
    "collegeName",
    "academicYear",
    "section",
    "dateOfBirth",
    "gender",
    "skills",
    "areaOfInterest",
    "portfolioUrl",
    "linkedinUrl",
    "githubUrl",
    "emergencyContactName",
    "emergencyContactPhone"
  ];

  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  if (req.file) {
    user.profileImage = await uploadToCloudinary(req.file, "certitrust/profile-images", "image");
  }

  await user.save();

  const company = await ensureCompanyProfile(user);

  res.json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        password: undefined
      },
      company
    }
  });
});
