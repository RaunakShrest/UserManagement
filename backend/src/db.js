import mongoose from "mongoose";

const DB_URL =
  process.env.NODE_ENV === "DEV"
    ? process.env.DB_URL_DEV
    : process.env.DB_URL_PROD;

const dbConnect = () => {
  return mongoose.connect(DB_URL);
};

export { dbConnect };
