import { Registration } from "../models/registration.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const markAttendance = asyncHandler(async (req, res) => {
  const { qrToken, eventId } = req.body;

  if (!qrToken || !eventId) {
    throw new ApiError(400, "qrToken and eventId are required");
  }

  const registration = await Registration.findOne({
    qrToken,
    event: eventId,
  }).populate("user", "name email");

  if (!registration) {
    throw new ApiError(404, "Invalid QR — registration not found");
  }

  if (registration.attended) {
    throw new ApiError(409, `Already marked — ${registration.user.name} scanned before`);
  }

  registration.attended = true;
  registration.attendedAt = new Date();
  await registration.save();

  res.status(200).json(
    new ApiResponse(200, registration, `Attendance marked for ${registration.user.name}`)
  );
});

const getAttendanceList = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({
    event: req.params.eventId,
    attended: true,
  }).populate("user", "name email usn department");

  res.status(200).json(
    new ApiResponse(200, registrations, "Attendance list fetched")
  );
});

export { markAttendance, getAttendanceList };