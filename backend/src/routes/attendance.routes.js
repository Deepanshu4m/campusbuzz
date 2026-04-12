import { Router } from "express";
import { markAttendance, getAttendanceList } from "../controllers/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/mark", verifyJWT, authorizeRoles("club_admin", "super_admin"), markAttendance);
router.get("/:eventId/list", verifyJWT, authorizeRoles("club_admin", "super_admin"), getAttendanceList);

export default router;