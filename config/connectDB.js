import mongoose from "mongoose";

const connectDB = () => {
  try {
    mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Database error");
  }
};

export default connectDB;
