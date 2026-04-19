import { Router } from "express";
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
} from "../controllers/registration.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/my", verifyJWT, getMyRegistrations);

router.post("/:eventId/register", verifyJWT, registerForEvent);
router.delete("/:eventId/cancel", verifyJWT, cancelRegistration);
router.get(
  "/event/:eventId/list",
  verifyJWT,
  authorizeRoles("club_admin", "super_admin"),
  getEventRegistrations
);

export default router;