import mongoose from "mongoose";

let connectionPromise;

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGODB_URI or MONGO_URI is not configured");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).then((connection) => {
      console.log("MongoDB connected");
      return connection;
    });
  }

  return connectionPromise;
};

export default connectDatabase;
