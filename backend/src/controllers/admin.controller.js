import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { Registration } from "../models/registration.model.js";
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

const updateEventStatus = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const { status } = req.body;

  const validStatuses = ["upcoming", "ongoing", "completed", "cancelled"];
  if (!validStatuses.includes(status)) throw new ApiError(400, "Invalid status");

  const event = await Event.findByIdAndUpdate(
    eventId,
    { status },
    { new: true }
  ).populate("createdBy", "name email");

  if (!event) throw new ApiError(404, "Event not found");

  res.status(200).json(new ApiResponse(200, event, "Event status updated"));
});

const getMyEventsAnalytics = asyncHandler(async (req, res) => {
  const events = await Event.find({ createdBy: req.user._id }).sort({ date: -1 });

  const analytics = await Promise.all(
    events.map(async (event) => {
      const totalRegistrations = await Registration.countDocuments({ event: event._id });
      const totalAttended = await Registration.countDocuments({ event: event._id, attended: true });

      return {
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        venue: event.venue,
        category: event.category,
        status: event.status,
        capacity: event.capacity,
        isOpen: event.isOpen,
        banner: event.banner,
        totalRegistrations,
        totalAttended,
      };
    })
  );

  res.status(200).json(new ApiResponse(200, analytics, "My events analytics fetched"));
});

export { getAllUsers, updateUserRole, getAllEventsAdmin, updateEventStatus, getMyEventsAnalytics };