import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { PendingVerification } from "../models/pendingVerification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOTP, hashOTP, verifyOTP } from "../utils/otp.js";
import { sendOTPEmail } from "../utils/sendEmail.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const initiateRegister = asyncHandler(async (req, res) => {
  const { name, email, password, usn, department } = req.body;

  if (!name || !email || !password || !usn || !department) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ $or: [{ email }, { usn: usn.toUpperCase() }] });
  if (existingUser) throw new ApiError(409, "Email or USN already registered");

  const otp = generateOTP();
  const hashedOTPValue = hashOTP(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await PendingVerification.findOneAndUpdate(
    { email },
    {
      hashedOTP: hashedOTPValue,
      userData: { name, email, usn: usn.toUpperCase(), password, department },
      expiresAt,
    },
    { upsert: true, new: true }
  );

  await sendOTPEmail(email, name, otp);

  return res.status(200).json(new ApiResponse(200, {}, "OTP sent to your email"));
});

const verifyOTPAndRegister = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const pending = await PendingVerification.findOne({ email });
  if (!pending) throw new ApiError(404, "No pending registration. Please register again.");

  if (new Date() > pending.expiresAt) {
    await PendingVerification.deleteOne({ email });
    throw new ApiError(410, "OTP expired. Please register again.");
  }

  if (!verifyOTP(otp, pending.hashedOTP)) {
    throw new ApiError(401, "Invalid OTP");
  }

  const { name, usn, password, department } = pending.userData;

  const user = await User.create({ name, email, usn, password, department });
  await PendingVerification.deleteOne({ email });

  const created = await User.findById(user._id).select("-password -refreshToken");
  return res.status(201).json(new ApiResponse(201, created, "Registration successful"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, "Email and password required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const isValid = await user.isPasswordCorrect(password);
  if (!isValid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Login successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken;
  if (!incomingToken) throw new ApiError(401, "Unauthorized");

  const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded._id);

  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Refresh token expired or invalid");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

const getMyBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("badges name");
  res.status(200).json(new ApiResponse(200, { badges: user.badges }, "Badges fetched"));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found");
  return res.status(200).json(new ApiResponse(200, user, "Profile fetched"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { name, phone } },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, updated, "Profile updated"));
});

export {
  initiateRegister,
  verifyOTPAndRegister,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  getMyBadges,
  getProfile,
  updateProfile,
};