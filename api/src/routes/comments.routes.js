import express from "express";
const router = express.Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createComment,
  deleteComment,
  editComment,
  getPostComments,
  getcomments,
  likeComment,
} from "../controllers/comments.controller.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

router.route("/createComment").post(verifyJWT, createComment);
router.route("/getPostComments/:postId").get(getPostComments);
router.route("/likeComment/:commentId").put(verifyJWT, likeComment);
router.route("/getcomments").get(verifyJWT, isAdmin, getcomments);
router.route("/editComment/:commentId").put(verifyJWT, editComment);
router.route("/deleteComment/:commentId").delete(verifyJWT, deleteComment);

export default router;
