import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["student", "college", "company", "mentor", "admin"],
      required: true
    },
    profileImage: {
      url: String,
      publicId: String
    },
    rollNo: String,
    registerNo: String,
    degree: String,
    branch: String,
    department: String,
    collegeName: String,
    academicYear: String,
    section: String,
    dateOfBirth: String,
    gender: String,
    companyName: String,
    phone: String,
    alternatePhone: String,
    personalEmail: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    skills: String,
    areaOfInterest: String,
    portfolioUrl: String,
    linkedinUrl: String,
    githubUrl: String,
    designation: String,
    organizationEmail: String,
    emergencyContactName: String,
    emergencyContactPhone: String
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
