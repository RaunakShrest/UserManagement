import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";

const userTypes = () => [
  process.env.USER_TYPE_ADMIN,
  process.env.USER_TYPE_USER,
];
const userStatus = () => [
  process.env.USER_STATUS_PENDING,
  process.env.USER_STATUS_ENABLED,
  process.env.USER_STATUS_DISABLED,
];
const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await UserModel.findOne({ _id: userId });
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    if (!error.message) {
      error.message =
        "something went wrong while generating refresh and access tokens";
    }
    next(error);
  }
};
const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "User not authenticated"));
    }

    if (req.user.status === "disabled") {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "User account disabled"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "User fetched successfully"));
  } catch (error) {
    next(
      new ApiError(
        500,
        error.message || "An error occurred while fetching the current user"
      )
    );
  }
};
const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    let decodedRefreshToken;

    try {
      decodedRefreshToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      error.statusCode = 401;
      error.data = null;
      error.success = false;
      error.name = "jwt error";
      next(error);
    }

    const user = await UserModel.findOne({ _id: decodedRefreshToken?._id });

    if (!user) {
      throw new ApiError(404, "unknown user");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const { refreshToken: newRefreshToken, accessToken } =
      await generateRefreshAndAccessToken(user?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "token refreshed successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while generating access token";
    }
    next(error);
  }
};
const userSignup = async (req, res, next) => {
  try {
    const {
      userName,
      email,
      password,
      phoneNumber,
      userType,
      status,
      address,
    } = req.body;

    const requiredFields = {
      userName,
      email,
      password,
      phoneNumber,
      userType,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`
      );
    }

    if (address) {
      const requiredAddressFields = ["zip", "city", "country", "addressLine"];
      const missingAddressFields = requiredAddressFields.filter(
        (field) => !address[field]
      );

      if (missingAddressFields.length > 0) {
        throw new ApiError(
          400,
          `Missing required address fields: ${missingAddressFields.join(", ")}`
        );
      }
    }
    const acceptableUserTypes = userTypes();
    if (!acceptableUserTypes.includes(userType.toLowerCase())) {
      throw new ApiError(400, "Invalid user type provided");
    }

    if (status) {
      const acceptableUserStatus = userStatus();
      if (!acceptableUserStatus.includes(status.toLowerCase())) {
        throw new ApiError(400, "Invalid user status provided");
      }
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User already exists with the provided email");
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      userName,
      email,
      password: hashedPassword,
      phoneNumber,
      userType: userType.toLowerCase(),
      status: status ? status.toLowerCase() : "enabled",
    };

    if (address) {
      userData.address = {
        zip: address.zip,
        city: address.city,
        country: address.country,
        addressLine: address.addressLine,
        state: address.state || undefined,
      };
    }

    const newUser = await UserModel.create(userData);

    const createdUser = await UserModel.findById(newUser._id).select(
      "-password -__v -refreshToken"
    );

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return next(
        new ApiError(409, `User with this ${duplicateField} already exists`)
      );
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return next(
        new ApiError(400, `Validation failed: ${validationErrors.join(", ")}`)
      );
    }

    if (!error.statusCode) {
      error = new ApiError(
        500,
        "Internal server error during user registration"
      );
    }

    next(error);
  }
};
const userSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) {
      throw new ApiError(404, "User doesn't exist");
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      throw new ApiError(401, "Email or Password does not match");
    }
    if (
      existingUser.userType === "admin" &&
      existingUser.status !== "enabled"
    ) {
      throw new ApiError(403, "Admin user must be enabled to sign in");
    }

    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
      existingUser._id
    );

    const signedInUser = await UserModel.findOne({
      _id: existingUser._id,
    }).select("-__v -password -refreshToken");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: signedInUser, refreshToken, accessToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while signing user in";
    }
    next(error);
  }
};
const userSignout = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      error.statusCode = 401;
      error.message = "Invalid or expired token";
      return next(error);
    }

    await UserModel.findByIdAndUpdate(decodedToken._id, {
      $unset: { refreshToken: "" },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User signed out successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while signing user out";
    }
    next(error);
  }
};

export {
  generateRefreshAndAccessToken,
  refreshAccessToken,
  userSignup,
  getCurrentUser,
  userSignin,
  userSignout,
};
