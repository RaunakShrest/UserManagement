import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import {
  createUser,
  deleteUser,
  editUserInfo,
  getUserById,
  getUsers,
} from "../controllers/user.controller.js";

const router = express.Router();
router.get("/getUsers", checkUserAuth, getUsers);
router.get("/getUserById/:userId", checkUserAuth, getUserById);

router.post("/createUser", checkUserAuth, createUser);
router.delete("/deleteUser/:userId", checkUserAuth, deleteUser);
router.patch("/editUser/:userId", checkUserAuth, editUserInfo);
export default router;
