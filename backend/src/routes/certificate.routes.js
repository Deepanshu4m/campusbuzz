import { Router } from "express";
import { downloadCertificate } from "../controllers/certificate.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:registrationId", verifyJWT, downloadCertificate);

export default router;