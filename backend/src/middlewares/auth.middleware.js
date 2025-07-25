import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { UserModel } from "../models/user.model.js";

const checkUserAuth = async (req, _, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Unauthorized: Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await UserModel.findById(decoded._id).select(
      "-__v -refreshToken"
    );

    if (!user) {
      return next(new ApiError(401, "Unauthorized: User not found"));
    }

    req.user = user;
    next();
  } catch (err) {
    const isJwtError = [
      "TokenExpiredError",
      "JsonWebTokenError",
      "NotBeforeError",
    ].includes(err.name);
    const message = isJwtError
      ? "Unauthorized: Invalid or expired token"
      : "Authentication failed";
    err.statusCode = 401;
    err.message = message;
    return next(err);
  }
};

export { checkUserAuth };
