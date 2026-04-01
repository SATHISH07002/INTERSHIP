import mongoose from "mongoose";

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
};

export default connectDatabase;
