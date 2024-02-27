import { Comment } from "./../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createComment = asyncHandler(async (req, res) => {
  const { content, postId, userId } = req.body;
  // Check if userId matches the authenticated user's id
  const user = req.user?._id?.toString();
  console.log(user === userId);
  if (userId !== user) {
    throw new ApiError(403, "You are not allowed to create this comment");
  }

  // Create the new comment
  const newComment = await Comment.create({
    content,
    postId,
    userId,
  });

  // Return a JSON response with the new comment
  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "New comment created"));
});
const getPostComments = asyncHandler(async (req, res) => {
  try {
    console.log(req.params.postId);
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });
    console.log(comments);
    return res.status(200).json(comments);
  } catch (error) {
    throw new ApiError(403, "error in getting comments");
  }
});

const likeComment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    } else {
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    throw new ApiError(403, "error in getting likes");
  }
});
const editComment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      throw new ApiError(403, "You are not allowed to edit this comment");
    }

    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content,
      },
      { new: true }
    );
    res.status(200).json(editedComment);
  } catch (error) {
    throw new ApiError(500, "error in editing comments");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      throw new ApiError(403, "You are not allowed to delete this comment");
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json("Comment has been deleted");
  } catch (error) {
    throw new ApiError(500, "Error in deleting comments");
  }
});

const getcomments = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin)
    return next(errorHandler(403, 'You are not allowed to get all comments'));
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "desc" ? -1 : 1;
    const comments = await Comment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalComments = await Comment.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthComments = await Comment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ comments, totalComments, lastMonthComments });
  } catch (error) {
    throw new ApiError(500, "error in getting comments details");
  }
});

export {
  createComment,
  getPostComments,
  likeComment,
  getcomments,
  deleteComment,
  editComment,
};
