import mongoose from "mongoose";

const pendingVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  hashedOTP: { type: String, required: true },
  userData: { type: Object, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export const PendingVerification = mongoose.model("PendingVerification", pendingVerificationSchema);