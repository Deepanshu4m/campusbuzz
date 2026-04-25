import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import eventRouter from "./routes/event.routes.js";
import registrationRouter from "./routes/registration.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
import certificateRouter from "./routes/certificate.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/registrations", registrationRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/certificates", certificateRouter);
app.use("/api/v1/admin", adminRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export { app };