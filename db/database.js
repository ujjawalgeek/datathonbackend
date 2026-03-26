import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      `MongoDB connected !! Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(error);
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
