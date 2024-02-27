import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { mailHelper } from "../utils/emailHelper.js";
import crypto from "crypto";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if ([username, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    return res.status(400).json({
      message: "User with email or name already exists",
    });
  }
  const profileLocalPath = req.files?.profilePicture[0]?.path;
  const profilePicture = await uploadOnCloudinary(profileLocalPath);
  const user = await User.create({
    username,
    email,
    password,
    profilePicture: profilePicture?.url,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    return res.status(500).json({
      message: "Something went wrong while registering the user",
    });
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const googleAuth = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    user.refreshToken = undefined;
    user.password = undefined;
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: user,
            accessToken,
            refreshToken,
          },
          "User logged In Successfully"
        )
      );
  } else {
    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    const newUser = await User.create({
      username:
        req.body.username.split(" ").join("").toLowerCase() +
        Math.random().toString(36).slice(-8),
      email: req.body.email,
      password: generatedPassword,
      profilePicture: req.body.googlePhotoUrl,
    });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: newUser,
        },
        "User logged In Successfully"
      )
    );
  }
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({
      message: " email is required",
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "User does not exist",
    });
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    return res.status(400).json({
      message: "User does not exist",
    });
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      },
    },
    { new: true }
  );
  console.log(user);
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
const deleteUser = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    throw new ApiError(403, "You are not allowed to delete this user");
  }

  try {
    await User.findByIdAndDelete(req.params.userId);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user deleted successfully"));
  } catch (error) {
    next(error);
  }
});
const getAllUsers = asyncHandler(async (req, res) => {
  const startIndex = parseInt(req.query.startIndex) || 0;
  const limit = parseInt(req.query.limit) || 9;
  const sortDirection = parseInt(req.query.order === "asc" ? 1 : -1);
  const user = await User.find()
    .sort({ createdAt: sortDirection })
    .skip(startIndex)
    .limit(limit)
    .select("-password");
  const totalUser = await User.countDocuments();

  const now = new Date();

  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );
  const lastMonthUser = await User.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, totalUser, lastMonthUser },
        "getting all user successfully"
      )
    );
});
const userInComments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select(
    "-password -refreshToken"
  );
  console.log(user);
  if (!user) {
    throw new ApiError(409, "No user found");
  }
  return res.status(200).json(user);
});
export {
  registerUser,
  googleAuth,
  loginUser,
  logoutUser,
  updateAccountDetails,
  deleteUser,
  getAllUsers,
  userInComments,
};
