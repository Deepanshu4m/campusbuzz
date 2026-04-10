import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";


const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, venue, category, capacity, certificateTemplate } = req.body;

    if (!title || !description || !date || !venue) {
        throw new ApiError(400, "Title, description, date and venue are required");
    }

    let bannerUrl = "";
    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file.path);
        if (!uploaded) throw new ApiError(500, "Banner upload failed");
        bannerUrl = uploaded.url;
    }

    const event = await Event.create({
        title,
        description,
        date,
        venue,
        category,
        capacity,
        certificateTemplate,
        banner: bannerUrl,
        createdBy: req.user._id,
    });

    res.status(201).json(new ApiResponse(201, event, "Event created successfully"));
});


const getAllEvents = asyncHandler(async (req, res) => {
    const { category, status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const events = await Event.find(filter)
        .populate("createdBy", "name email")
        .sort({ date: 1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(200, { events, total, page: Number(page), limit: Number(limit) }, "Events fetched successfully")
    );
});


const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id).populate("createdBy", "name email");

    if (!event) throw new ApiError(404, "Event not found");

    res.status(200).json(new ApiResponse(200, event, "Event fetched successfully"));
});


const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");


    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "super_admin") {
        throw new ApiError(403, "You are not allowed to update this event");
    }

    const { title, description, date, venue, category, capacity, isOpen, status, certificateTemplate } = req.body;

    let bannerUrl = event.banner;
    if (req.file) {
        const uploaded = await uploadOnCloudinary(req.file.path);
        if (!uploaded) throw new ApiError(500, "Banner upload failed");
        bannerUrl = uploaded.url;
    }

    const updated = await Event.findByIdAndUpdate(
        req.params.id,
        {
            $set: {
                title: title || event.title,
                description: description || event.description,
                date: date || event.date,
                venue: venue || event.venue,
                category: category || event.category,
                capacity: capacity || event.capacity,
                isOpen: isOpen ?? event.isOpen,
                status: status || event.status,
                certificateTemplate: certificateTemplate || event.certificateTemplate,
                banner: bannerUrl,
            },
        },
        { new: true }
    );

    res.status(200).json(new ApiResponse(200, updated, "Event updated successfully"));
});

const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== "super_admin") {
        throw new ApiError(403, "You are not allowed to delete this event");
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json(new ApiResponse(200, {}, "Event deleted successfully"));
});

export { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };