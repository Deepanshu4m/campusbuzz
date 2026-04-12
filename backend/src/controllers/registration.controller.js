import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import { Registration } from "../models/registration.model.js";
import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) throw new ApiError(404, "Event not found");
  if (!event.isOpen) throw new ApiError(400, "Registrations are closed for this event");
  if (event.registeredCount >= event.capacity) throw new ApiError(400, "Event is full");

  const existing = await Registration.findOne({
    user: req.user._id,
    event: req.params.eventId,
  });
  if (existing) throw new ApiError(409, "You are already registered for this event");
  
  const qrToken = uuidv4();
  const qrData = JSON.stringify({ qrToken, eventId: req.params.eventId });
  const qrCode = await QRCode.toDataURL(qrData);

  const registration = await Registration.create({
    user: req.user._id,
    event: req.params.eventId,
    qrCode,
    qrToken,
  });

  await Event.findByIdAndUpdate(req.params.eventId, { $inc: { registeredCount: 1 } });

  res.status(201).json(new ApiResponse(201, registration, "Registered successfully"));
});

const cancelRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findOne({
    user: req.user._id,
    event: req.params.eventId,
  });

  if (!registration) throw new ApiError(404, "Registration not found");
  if (registration.attended) throw new ApiError(400, "Cannot cancel after attendance is marked");

  await Registration.findByIdAndDelete(registration._id);
  await Event.findByIdAndUpdate(req.params.eventId, { $inc: { registeredCount: -1 } });

  res.status(200).json(new ApiResponse(200, {}, "Registration cancelled"));
});

const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ user: req.user._id })
    .populate("event", "title date venue status banner")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, registrations, "Registrations fetched"));
});

const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, "Event not found");

  if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "super_admin") {
    throw new ApiError(403, "Not authorized");
  }

  const registrations = await Registration.find({ event: req.params.eventId })
    .populate("user", "name email usn department")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, registrations, "Event registrations fetched"));
});

export { registerForEvent, cancelRegistration, getMyRegistrations, getEventRegistrations };