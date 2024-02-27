import express from "express";

import {
  loginUser,
  registerUser,
  logoutUser,
  changeCurrentPassword,
  forgetPassword,
  passwordReset,
  googleAuth,
  updateAccountDetails,
  deleteUser,
  updateProfile,
  getAllUsers,
  userInComments,
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
const router = express.Router();

router.route("/sign-up").post(registerUser);
router.route("/google").post(googleAuth);
router.route("/sign-in").post(loginUser, isAdmin);
router.route("/signout").post(verifyJWT, logoutUser);
router.route("/delete-user/:userId").delete(verifyJWT, deleteUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-account").put(verifyJWT, updateAccountDetails);
router
  .route("/upload-profile")
  .patch(verifyJWT, upload.single("imageFile"), updateProfile);
router.route("/forgotPassword").post(forgetPassword);
router.route("/password/reset/:token").patch(passwordReset);
router.route("/get-all-users").get(verifyJWT, isAdmin, getAllUsers);
router.route("/:userId").get(userInComments);
export default router;
