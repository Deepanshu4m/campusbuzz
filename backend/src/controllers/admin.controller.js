import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, users, "Users fetched"));
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const validRoles = ["student", "club_admin", "super_admin"];
  if (!validRoles.includes(role)) throw new ApiError(400, "Invalid role");

  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  res.status(200).json(new ApiResponse(200, user, "Role updated"));
});

const getAllEventsAdmin = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, events, "All events fetched"));
});

export { getAllUsers, updateUserRole, getAllEventsAdmin };