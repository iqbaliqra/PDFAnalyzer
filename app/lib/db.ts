import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  if (mongoose.connections[0].readyState) return;

  await mongoose.connect(process.env.MONGO_URI as string, {
    dbName: "pdf-analyzer",
  });
};