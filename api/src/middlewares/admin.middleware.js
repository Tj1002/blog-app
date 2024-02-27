import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const isAdmin = asyncHandler(async (req, _, next) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw new ApiError(401, "Unauthorized request");
    }
    console.log(user);
    if (user.role === false) {
      throw new ApiError(401, "Unauthorized role");
    }
    next();
  } catch (error) {
    throw new ApiError(500, "Something went wrong in finding admin");
  }
});
