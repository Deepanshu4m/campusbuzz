import { Router } from "express";
import { getAllUsers, updateUserRole, getAllEventsAdmin } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("super_admin"));

router.get("/users", getAllUsers);
router.patch("/users/:userId/role", updateUserRole);
router.get("/events", getAllEventsAdmin);

export default router;