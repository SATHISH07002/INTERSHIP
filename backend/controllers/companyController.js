import asyncHandler from "../middleware/asyncHandler.js";
import Company from "../models/Company.js";

export const getCompanies = asyncHandler(async (_req, res) => {
  const companies = await Company.find().populate("owner", "fullName email").sort({ name: 1 });

  res.json({
    success: true,
    data: companies
  });
});
