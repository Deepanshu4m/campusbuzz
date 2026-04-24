import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const FEATURES = [
  "QR-based check-in",
  "Role-based dashboards",
  "PDF certificates",
  "Real-time notifications",
  "Multi-club support",
];

const STATS = [
  { value: "12", label: "Active clubs" },
  { value: "200", label: "Students registered" },
  { value: "50", label: "Events hosted" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

function Hero() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <nav className="flex items-center justify-between px-10 py-6">
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.25rem", color: "#111", letterSpacing: "-0.01em" }}>
          CampusBuzz
        </span>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/events")}
              className="text-sm px-5 py-2 rounded-full cursor-pointer border-none"
              style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}
            >
              Go to Events
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm px-5 py-2 rounded-full cursor-pointer"
                style={{ color: "#555", backgroundColor: "transparent", border: "1px solid #d0cfc9", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm font-medium px-5 py-2 rounded-full cursor-pointer border-none"
                style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      <div className="mx-10" style={{ height: "1px", backgroundColor: "#e0dfd9" }} />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">

        <motion.p
          {...fadeUp(0)}
          className="text-xs font-medium uppercase mb-8"
          style={{ letterSpacing: "0.18em", color: "#888" }}
        >
          NMIT · Campus Event Platform
        </motion.p>

        <motion.h1
          {...fadeUp(0.1)}
          className="font-normal"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
            lineHeight: 1.05,
            color: "#111",
            letterSpacing: "-0.03em",
            maxWidth: "800px",
            marginBottom: "0.4rem",
          }}
        >
          Campus events,
        </motion.h1>

        <motion.h1
          {...fadeUp(0.18)}
          className="font-normal"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: "italic",
            fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
            lineHeight: 1.05,
            color: "#888",
            letterSpacing: "-0.03em",
            maxWidth: "800px",
            marginBottom: "2.5rem",
          }}
        >
          all in one place.
        </motion.h1>

        <motion.p
          {...fadeUp(0.26)}
          className="text-sm mb-10"
          style={{ color: "#666", fontWeight: 300, maxWidth: "420px", lineHeight: 1.75 }}
        >
          Discover, register, and attend events across all clubs at NMIT.
          QR-based entry, live attendance, and digital certificates — built for you.
        </motion.p>

        <motion.div {...fadeUp(0.34)} className="flex items-center gap-3">
          <button
            onClick={() => navigate(isAuthenticated ? "/events" : "/register")}
            className="text-sm font-medium px-7 py-3 rounded-full cursor-pointer border-none"
            style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}
          >
            {isAuthenticated ? "Browse Events" : "Get Started →"}
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => navigate("/events")}
              className="text-sm px-7 py-3 rounded-full cursor-pointer"
              style={{ color: "#333", backgroundColor: "transparent", border: "1px solid #c8c7c1", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}
            >
              Browse Events
            </button>
          )}
        </motion.div>

        <motion.div
          {...fadeUp(0.44)}
          className="flex flex-wrap justify-center gap-2 mt-14"
        >
          {FEATURES.map((feat) => (
            <span
              key={feat}
              className="text-xs px-4 py-1.5 rounded-full"
              style={{ color: "#777", backgroundColor: "#eceae4", border: "1px solid #dddbd5", letterSpacing: "0.01em" }}
            >
              {feat}
            </span>
          ))}
        </motion.div>

        <motion.div
          {...fadeUp(0.54)}
          className="grid grid-cols-3 w-full mt-20"
          style={{ maxWidth: "560px", borderTop: "1px solid #dddbd5", borderBottom: "1px solid #dddbd5" }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-8"
              style={{ borderRight: i < STATS.length - 1 ? "1px solid #dddbd5" : "none" }}
            >
              <span
                className="font-normal leading-none"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.6rem", color: "#111", letterSpacing: "-0.03em" }}
              >
                {stat.value}
                <span style={{ color: "#aaa", fontSize: "2rem" }}>+</span>
              </span>
              <span
                className="text-xs mt-1.5"
                style={{ color: "#888", letterSpacing: "0.02em" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

      </main>
    </div>
  );
}

export default Hero;