import { Router } from "express";
import {
  getAllUsers,
  updateUserRole,
  getAllEventsAdmin,
  updateEventStatus,
  getMyEventsAnalytics,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/users", authorizeRoles("super_admin"), getAllUsers);
router.patch("/users/:userId/role", authorizeRoles("super_admin"), updateUserRole);
router.get("/events", authorizeRoles("super_admin"), getAllEventsAdmin);
router.patch("/events/:eventId/status", authorizeRoles("super_admin"), updateEventStatus);
router.get("/my-events-analytics", authorizeRoles("club_admin", "super_admin"), getMyEventsAnalytics);

export default router;