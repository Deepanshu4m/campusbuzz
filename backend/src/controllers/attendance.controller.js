import { Registration } from "../models/registration.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const BADGE_RULES = [
  { count: 1, badge: "first_event" },
  { count: 3, badge: "regular" },
  { count: 5, badge: "enthusiast" },
];

const awardBadgesIfEarned = async (userId) => {
  const attendedCount = await Registration.countDocuments({
    user: userId,
    attended: true,
  });

  const user = await User.findById(userId);

  const newBadges = BADGE_RULES
    .filter(({ count, badge }) => attendedCount >= count && !user.badges.includes(badge))
    .map(({ badge }) => badge);

  if (newBadges.length > 0) {
    user.badges.push(...newBadges);
    await user.save();
  }
};

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

  awardBadgesIfEarned(registration.user._id).catch((err) =>
    console.error("Badge award failed:", err)
  );

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