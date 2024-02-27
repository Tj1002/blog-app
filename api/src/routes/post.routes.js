import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createPostController,
  deletePostController,
  getPostsController,
  updatePostController,
} from "../controllers/post.controller.js";
const router = express.Router();

router
  .route("/create-post")
  .post(verifyJWT, upload.single("image"), createPostController);
router.route("/getposts").get(getPostsController);

router
  .route("/delete-post/:postId/:userId")
  .delete(verifyJWT, deletePostController);
router
  .route("/update-post/:postId/:userId")
  .put(verifyJWT, upload.single("image"), updatePostController);

router.route("/getAllPost/:postSlug");
export default router;
