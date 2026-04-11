import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    banner: { type: String, default: "" }, 
    category: { type: String, default: "General" },
    capacity: { type: Number, default: 100 },
    registeredCount: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificateTemplate: { type: String, default: "" }, 
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);