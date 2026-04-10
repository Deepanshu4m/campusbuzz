import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllEvents);
router.get("/:id", getEventById);

router.post(
  "/",
  verifyJWT,
  authorizeRoles("club_admin", "super_admin"),
  upload.single("banner"),
  createEvent
);

router.patch(
  "/:id",
  verifyJWT,
  authorizeRoles("club_admin", "super_admin"),
  upload.single("banner"),
  updateEvent
);

router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles("club_admin", "super_admin"),
  deleteEvent
);

export default router;