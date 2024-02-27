import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Post } from "../models/post.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const createPostController = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    throw new ApiError(400, "all fields are required");
  }
  const file = req.file;
  console.log("file", file);
  if (!file) {
    throw new ApiError(400, "No file path");
  }
  const localfilePath = file && file.path;
  console.log("localFile", localfilePath);

  if (!localfilePath) {
    throw new ApiError(400, "No local path");
  }
  const imageUrl = await uploadOnCloudinary(localfilePath);
  console.log("imageurl", imageUrl);
  if (!imageUrl) {
    throw new ApiError(400, "No local path");
  }
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = await Post.create({
    title,
    content,
    category,
    image: imageUrl.url,
    slug,
    userId: req.user.id,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, newPost, "post created successfully"));
});
const getPostsController = async (req, res) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = parseInt(req.query.order === "asc" ? 1 : -1);

    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    const data = { posts, totalPosts, lastMonthPosts };
    res
      .status(200)
      .json(new ApiResponse(200, data, "getting post successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
};

const deletePostController = async (req, res) => {
  const user = req.user;
  const post = await Post.findById(req.params.postId);
  const loggedUserId = user._id.toString();

  if (!user.isAdmin && loggedUserId !== post.userId) {
    throw new ApiError(403, "You are not allowed to delete this post");
  }

  await Post.findByIdAndDelete(post._id);
  return res
    .status(200)
    .json(new ApiResponse(200, "The post has been deleted"));
};

const updatePostController = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    res.status(403).json("You are not allowed to update this post");
  }
  const file = req.file;
  console.log("file", file);

  const localfilePath = file && file.path;
  console.log("localFile", localfilePath);
  const imageUrl = await uploadOnCloudinary(localfilePath);
  console.log("imageurl", imageUrl);

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: imageUrl ? imageUrl.url : req.body.image,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};
export {
  createPostController,
  getPostsController,
  deletePostController,
  updatePostController,
};
