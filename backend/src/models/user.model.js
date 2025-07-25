import { config } from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

config();

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    userType: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["user", "admin"],
      default: "user",
    },

    address: {
      zip: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      addressLine: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
      },
    },
    status: {
      type: String,
      required: true,
      enum: [
        process.env.USER_STATUS_PENDING,
        process.env.USER_STATUS_VERIFIED,
        process.env.USER_STATUS_DECLINED,
        process.env.USER_STATUS_ENABLED,
      ],
      default: process.env.USER_STATUS_PENDING,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userType: this.userType,
      email: this.email,
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const UserModel = mongoose.model("User", userSchema);

export { UserModel };
