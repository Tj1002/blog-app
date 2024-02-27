import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { mailHelper } from "../utils/emailHelper.js";
import crypto from "crypto";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import path from "path";

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
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or name already exists");
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
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});
const googleAuth = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
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
    throw new ApiError(400, " email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
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
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(404, "Incorrect password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "email not found");
  }
  const forgetToken = await user.getForgotPasswordToken();
  console.log(forgetToken);
  await user.save({ validateBeforeSave: false });
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/password/reset/${forgetToken}`;
  console.log(`myurl:`, myUrl);
  const message = `Copy paste this link in url \n\n ${myUrl}`;
  try {
    await mailHelper({
      email: user.email,
      subject: "E-Commerce - Password reset email",
      message,
    });

    // json reponse if email is success
    res.status(200).json({
      succes: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry;
    user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Something went wrong ");
  }
});
const passwordReset = asyncHandler(async (req, res, next) => {
  //get token from params
  const token = req.params.token;

  // hash the token as db also stores the hashed version
  const encryToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log("encryToken", encryToken);

  // find user based on hased on token and time in future
  const user = await User.findOne({
    encryToken,

    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Token is invalid or expired", 400);
  }

  // check if password and conf password matched
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("password and confirm password do not match", 400)
    );
  }

  // update password field in DB
  user.password = req.body.password;

  // reset token fields
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);
  // save the user
  await user.save();

  // send a JSON response OR send token

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user }, "password changed successfully"));
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
// export isAdminAllUser=asyncHandler(async(req,res))
const updateProfile = asyncHandler(async (req, res) => {
  const profileLocalPath = req.file?.path;
  if (!profileLocalPath) {
    throw new ApiError(400, "profile is missing");
  }
  const profilePicture = await uploadOnCloudinary(profileLocalPath);
  if (!profilePicture.url) {
    throw new ApiError(400, "Error while uploading");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        profilePicture: profilePicture.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "profile picture updated successfully"));
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
  changeCurrentPassword,
  forgetPassword,
  passwordReset,
  updateAccountDetails,
  updateProfile,
  deleteUser,
  getAllUsers,
  userInComments,
};
