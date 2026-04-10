import mongoose, { Schema } from "mongoose";

const registrationSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        qrCode: { type: String, default: "" }, // generated qr code data url
        attended: { type: Boolean, default: false },
        certificateIssued: { type: Boolean, default: false },
        certificateUrl: { type: String, default: "" }, // cloudinary url
    },
    { timestamps: true }
);

// prevent duplicate registration
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

export const Registration = mongoose.model("Registration", registrationSchema);


    