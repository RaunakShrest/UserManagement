import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, userName, userType } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };
    let filters = {
      _id: { $ne: req.user._id },
    };

    if (userName) {
      filters.$or = [{ userName: { $regex: userName, $options: "i" } }];
    }

    if (userType) {
      if (
        !req.user ||
        req.user.userType !== process.env.USER_TYPE_SUPER_ADMIN
      ) {
        return res.status(403).json({
          status: 403,
          message: "Access denied. Only super-admin can filter by userType",
        });
      }

      const validUserTypes = [
        process.env.USER_TYPE_USER,
        process.env.USER_TYPE_ADMIN,
        process.env.USER_TYPE_SUPER_ADMIN,
      ];

      if (!validUserTypes.includes(userType)) {
        return res.status(400).json({
          status: 400,
          message: `Invalid userType. Must be one of: ${validUserTypes.join(
            ", "
          )}`,
        });
      }

      filters.userType = userType;
    }

    if (req.user.userType !== process.env.USER_TYPE_SUPER_ADMIN) {
      filters.userType = { $in: ["user"] };
    }

    const users = await UserModel.find(filters, "-password")
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalItems = await UserModel.countDocuments(filters);

    return res.status(200).json({
      statusCode: 200,
      data: "Users fetched successfully",
      message: {
        users: users || [],
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / options.limit),
          currentPage: options.page,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    next(error);
  }
};
const createUser = async (req, res, next) => {
  try {
    if (!req.user || req.user.userType !== process.env.USER_TYPE_SUPER_ADMIN) {
      return res.status(403).json({
        status: 403,
        message: "Access denied. Only super-admin can create users",
      });
    }

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
      return res.status(400).json({
        status: 400,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    if (address) {
      const requiredAddressFields = ["zip", "city", "country", "addressLine"];
      const missingAddressFields = requiredAddressFields.filter(
        (field) => !address[field]
      );

      if (missingAddressFields.length > 0) {
        return res.status(400).json({
          status: 400,
          message: `Missing required address fields: ${missingAddressFields.join(
            ", "
          )}`,
        });
      }
    }

    const allowedUserTypes = ["admin", "user"];
    if (!allowedUserTypes.includes(userType.toLowerCase())) {
      return res.status(400).json({
        status: 400,
        message: `Invalid user type. Super-admin can only create: ${allowedUserTypes.join(
          ", "
        )}`,
      });
    }

    if (status) {
      const acceptableUserStatus = ["enabled", "disabled"]; // Adjust based on your userStatus() function
      if (!acceptableUserStatus.includes(status.toLowerCase())) {
        return res.status(400).json({
          status: 400,
          message: `Invalid user status. Allowed values: ${acceptableUserStatus.join(
            ", "
          )}`,
        });
      }
    }

    const existingUser = await UserModel.findOne({
      $or: [{ email: email }, { userName: userName }],
    });

    if (existingUser) {
      const duplicateField =
        existingUser.email === email ? "email" : "username";
      return res.status(409).json({
        status: 409,
        message: `User already exists with this ${duplicateField}`,
      });
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
      createdBy: req.user._id,
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

    return res.status(201).json({
      statusCode: 201,
      data: "User created successfully",
      message: {
        user: createdUser,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error.message);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        status: 409,
        message: `User with this ${duplicateField} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        status: 400,
        message: `Validation failed: ${validationErrors.join(", ")}`,
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Internal server error during user creation",
    });
  }
};
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        statusCode: 400,
        message: "User ID is required",
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        statusCode: 400,
        message: "You cannot delete your own account",
      });
    }

    const userToDelete = await UserModel.findById(userId);

    if (!userToDelete) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found",
      });
    }

    if (req.user.userType === "super-admin") {
      if (userToDelete.userType === "super-admin") {
        return res.status(403).json({
          statusCode: 403,
          message: "Super-admin cannot delete another super-admin",
        });
      }
    } else if (req.user.userType === "admin") {
      if (userToDelete.userType !== "user") {
        return res.status(403).json({
          statusCode: 403,
          message: "Admins can only delete regular users",
        });
      }
    } else {
      return res.status(403).json({
        statusCode: 403,
        message: "Access denied. Insufficient permissions to delete users",
      });
    }

    await UserModel.findByIdAndDelete(userId);

    return res.status(200).json({
      statusCode: 200,
      message: "User deleted successfully",
      data: {
        deletedUser: {
          _id: userToDelete._id,
          userName: userToDelete.userName,
          userType: userToDelete.userType,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        statusCode: 400,
        message: "Invalid user ID format",
      });
    }

    next(error);
  }
};
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid user ID format"));
    }

    const User = await UserModel.findById(userId).select(
      "-__v -password -refreshToken"
    );
    if (!User) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, User, "User details fetched successfully"));
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message = "Something went wrong while fetching user details";
    }
    next(error);
  }
};
const editUserInfo = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const currentUpdatedAt = new Date().toISOString();
    const updatedCompanyUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData, updatedAt: currentUpdatedAt },
      {
        new: true,
        runValidators: true,
        select: "-__v -password -refreshToken",
        timestamps: false,
      }
    );

    if (!updatedCompanyUser) {
      return next(new ApiError(404, "Company user not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedCompanyUser,
          "Company user info updated successfully"
        )
      );
  } catch (error) {
    console.error("Error while updating company user info:", error.message);

    if (!error.message) {
      error.message = "Something went wrong while updating company user info";
    }
    next(error);
  }
};
export { getUsers, createUser, deleteUser, getUserById, editUserInfo };
