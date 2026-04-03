import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDatabase from "../config/db.js";
import User from "../models/User.js";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";
import JobOffer from "../models/JobOffer.js";
import WorkLog from "../models/WorkLog.js";
import { generateCertificateId, generateVerificationId } from "../utils/generateCertificateId.js";

dotenv.config();

const sampleEmails = [
  "admin@certitrust.demo",
  "college@certitrust.demo",
  "company@certitrust.demo",
  "student@certitrust.demo",
  "mentor@certitrust.demo"
];

const seed = async () => {
  await connectDatabase();

  const existingUsers = await User.find({ email: { $in: sampleEmails } }).select("_id");
  const existingUserIds = existingUsers.map((user) => user._id);
  const existingCompanies = await Company.find({
    $or: [
      { contactEmail: { $in: sampleEmails } },
      { owner: { $in: existingUserIds } }
    ]
  }).select("_id");
  const existingCompanyIds = existingCompanies.map((company) => company._id);
  const existingInternships = await Internship.find({
    $or: [
      { student: { $in: existingUserIds } },
      { college: { $in: existingUserIds } },
      { companyUser: { $in: existingUserIds } },
      { company: { $in: existingCompanyIds } }
    ]
  }).select("_id");
  const existingInternshipIds = existingInternships.map((internship) => internship._id);

  if (existingInternshipIds.length) {
    await WorkLog.deleteMany({ internship: { $in: existingInternshipIds } });
  }

  if (existingCompanyIds.length || existingUserIds.length) {
    await JobOffer.deleteMany({
      $or: [
        { company: { $in: existingCompanyIds } },
        { postedBy: { $in: existingUserIds } }
      ]
    });
  }

  if (existingInternshipIds.length) {
    await Internship.deleteMany({ _id: { $in: existingInternshipIds } });
  }

  if (existingCompanyIds.length) {
    await Company.deleteMany({ _id: { $in: existingCompanyIds } });
  }

  if (existingUserIds.length) {
    await User.deleteMany({ _id: { $in: existingUserIds } });
  }

  const admin = await User.create({
    fullName: "Admin User",
    email: "admin@certitrust.demo",
    password: "Password@123",
    role: "admin",
    phone: "9000000001"
  });

  const college = await User.create({
    fullName: "College Coordinator",
    email: "college@certitrust.demo",
    password: "Password@123",
    role: "college",
    collegeName: "Sri Tech College",
    department: "Training and Placement",
    phone: "9000000002"
  });

  const companyUser = await User.create({
    fullName: "Company HR",
    email: "company@certitrust.demo",
    password: "Password@123",
    role: "company",
    companyName: "TechNova Solutions",
    designation: "HR Manager",
    organizationEmail: "company@technova.example",
    phone: "9000000003"
  });

  const student = await User.create({
    fullName: "Sample Student",
    email: "student@certitrust.demo",
    password: "Password@123",
    role: "student",
    rollNo: "22CSE101",
    registerNo: "REG220101",
    degree: "B.E",
    branch: "Computer Science and Engineering",
    department: "CSE",
    collegeName: "Sri Tech College",
    academicYear: "III Year",
    section: "A",
    phone: "9000000004",
    city: "Chennai",
    state: "Tamil Nadu",
    skills: "React, Node.js, MongoDB"
  });

  const mentor = await User.create({
    fullName: "Mentor Guide",
    email: "mentor@certitrust.demo",
    password: "Password@123",
    role: "mentor",
    designation: "Senior Developer",
    organizationEmail: "mentor@technova.example",
    phone: "9000000005"
  });

  const company = await Company.create({
    owner: companyUser._id,
    name: "TechNova Solutions",
    website: "https://technova.example",
    description: "Sample company for internship verification demos.",
    contactEmail: "company@certitrust.demo",
    officialDomains: ["technova.example"],
    verificationEmail: "verify@technova.example"
  });

  const internship = await Internship.create({
    student: student._id,
    college: college._id,
    companyUser: companyUser._id,
    company: company._id,
    role: "Full Stack Developer Intern",
    duration: "3 Months",
    stipend: "15000/month",
    internshipMode: "Hybrid",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    weeklyHours: "30",
    workLocation: "Chennai",
    companyEmail: "company@technova.example",
    mentorName: mentor.fullName,
    mentorEmail: mentor.email,
    mentorPhone: mentor.phone,
    projectTitle: "Internship Tracking Portal",
    projectDomain: "Web Development",
    responsibilities: "Built dashboard modules, API integration, and verification workflows.",
    learningGoals: "Improve MERN stack skills and production deployment understanding.",
    techStack: "React, Node.js, Express, MongoDB",
    status: "approved",
    verificationId: generateVerificationId(),
    mentorVerification: {
      status: "verified",
      email: mentor.email,
      verifiedAt: new Date()
    },
    companyVerification: {
      status: "verified",
      email: company.contactEmail,
      verifiedAt: new Date()
    },
    adminReview: {
      status: "verified",
      reviewedBy: admin._id,
      reviewedAt: new Date(),
      reason: "Sample internship approved for demo data."
    },
    companyDomainValid: true,
    collegeApproval: {
      approved: true,
      reason: "Approved by college coordinator",
      actedAt: new Date(),
      actedBy: college._id
    },
    companyApproval: {
      approved: true,
      reason: "Approved by company HR",
      actedAt: new Date(),
      actedBy: companyUser._id
    },
    certificate: {
      certificateId: generateCertificateId(),
      verificationId: generateVerificationId(),
      url: "https://example.com/sample-certificate.pdf",
      publicId: "sample-certificate",
      generatedAt: new Date()
    }
  });

  await JobOffer.create({
    company: company._id,
    postedBy: companyUser._id,
    title: "Frontend Intern",
    type: "internship",
    location: "Remote",
    stipend: "12000/month",
    applicationStartDate: "2026-04-01",
    applicationEndDate: "2026-05-15",
    description: "Work on React UI, API integration, and deployment support.",
    applications: [
      {
        student: student._id,
        appliedAt: new Date()
      }
    ]
  });

  await WorkLog.insertMany([
    {
      internship: internship._id,
      student: student._id,
      date: "2026-04-02",
      hoursWorked: 6,
      tasks: "Set up the dashboard shell and integrated authentication state.",
      reviewStatus: "approved",
      mentorRemarks: "Solid progress."
    },
    {
      internship: internship._id,
      student: student._id,
      date: "2026-04-03",
      hoursWorked: 5,
      tasks: "Connected the frontend to deployed backend endpoints and tested core flows.",
      reviewStatus: "pending"
    }
  ]);

  console.log("Sample data inserted successfully.");
  console.log("Login email: student@certitrust.demo");
  console.log("Login password: Password@123");

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Failed to seed sample data:", error);
  await mongoose.disconnect();
  process.exit(1);
});
