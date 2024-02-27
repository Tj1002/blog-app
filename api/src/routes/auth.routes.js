import express from "express";

import {
  loginUser,
  registerUser,
  logoutUser,
  googleAuth,
  updateAccountDetails,
  deleteUser,
  getAllUsers,
  userInComments,
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
const router = express.Router();

router.route("/sign-up").post(registerUser);
router.route("/google").post(googleAuth);
router.route("/sign-in").post(loginUser, isAdmin);
router.route("/signout").post(verifyJWT, logoutUser);
router.route("/delete-user/:userId").delete(verifyJWT, deleteUser);
router.route("/update-account").put(verifyJWT, updateAccountDetails);

router.route("/get-all-users").get(verifyJWT, isAdmin, getAllUsers);
router.route("/:userId").get(userInComments);
export default router;
