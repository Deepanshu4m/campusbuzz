import { Registration } from "../models/registration.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCertificatePDF } from "../utils/generateCertificate.js";

const downloadCertificate = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.registrationId)
    .populate("user", "name email")
    .populate("event", "title date venue status");

  if (!registration) throw new ApiError(404, "Registration not found");

  if (registration.user._id.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized");

  if (!registration.attended)
    throw new ApiError(400, "Certificate only available after attendance is marked");

  if (registration.event.status !== "completed")
    throw new ApiError(400, "Certificate available once event is marked completed");

  if (!registration.certificateIssued) {
    registration.certificateIssued = true;
    await registration.save();
  }

  generateCertificatePDF(res, {
    studentName: registration.user.name,
    eventTitle: registration.event.title,
    eventDate: registration.event.date,
    eventVenue: registration.event.venue,
  });
});

export { downloadCertificate };