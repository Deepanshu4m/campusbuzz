import { Router } from "express";
import {
  initiateRegister,
  verifyOTPAndRegister,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  getMyBadges,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/initiate-register", initiateRegister);
router.post("/verify-otp", verifyOTPAndRegister);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.get("/me", verifyJWT, getCurrentUser);
router.get("/me/badges", verifyJWT, getMyBadges);
router.get("/profile", verifyJWT, getProfile);
router.patch("/profile", verifyJWT, updateProfile);

export default router;