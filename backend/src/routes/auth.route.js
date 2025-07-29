import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import {
  userSignup,
  generateRefreshAndAccessToken,
  getCurrentUser,
  userSignin,
  userSignout,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/getAccessToken", generateRefreshAndAccessToken);
router.post("/refresh-access-token", refreshAccessToken);

router.get("/get-current-user", checkUserAuth, getCurrentUser);

router.post("/signin", userSignin);
router.post("/signup", userSignup);
router.post("/signout", userSignout);
export default router;
