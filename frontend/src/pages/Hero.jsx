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
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <nav className="flex items-center justify-between px-10 py-6">
        <span
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.25rem",
            color: "#111",
            letterSpacing: "-0.01em",
          }}
        >
          CampusBuzz
        </span>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/events")}
              style={{
                padding: "8px 20px",
                fontSize: "13px",
                fontWeight: 400,
                backgroundColor: "#111",
                color: "#f5f4f0",
                borderRadius: "100px",
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Go to Events
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#555",
                  backgroundColor: "transparent",
                  borderRadius: "100px",
                  border: "1px solid #d0cfc9",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "8px 20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#f5f4f0",
                  backgroundColor: "#111",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                }}
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>
      
      <div style={{ height: "1px", backgroundColor: "#e0dfd9", margin: "0 40px" }} />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">

        <motion.p
          {...fadeUp(0)}
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.18em",
            color: "#888",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
        >
          NMIT · Campus Event Platform
        </motion.p>

        <motion.h1
          {...fadeUp(0.1)}
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
            fontWeight: 400,
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
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: "italic",
            fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
            fontWeight: 400,
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
          style={{
            fontSize: "15px",
            fontWeight: 300,
            color: "#666",
            maxWidth: "420px",
            lineHeight: 1.75,
            marginBottom: "2.5rem",
          }}
        >
          Discover, register, and attend events across all clubs at NMIT.
          QR-based entry, live attendance, and digital certificates — built for you.
        </motion.p>

        <motion.div {...fadeUp(0.34)} className="flex items-center gap-3">
          <button
            onClick={() => navigate(isAuthenticated ? "/events" : "/register")}
            style={{
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#f5f4f0",
              backgroundColor: "#111",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            {isAuthenticated ? "Browse Events" : "Get Started →"}
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/events")}
              style={{
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: 400,
                color: "#333",
                backgroundColor: "transparent",
                borderRadius: "100px",
                border: "1px solid #c8c7c1",
                cursor: "pointer",
                letterSpacing: "0.01em",
              }}
            >
              Browse Events
            </button>
          )}
        </motion.div>

        <motion.div
          {...fadeUp(0.44)}
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px",
            marginTop: "3.5rem",
          }}
        >
          {FEATURES.map((feat) => (
            <span
              key={feat}
              style={{
                fontSize: "12px",
                fontWeight: 400,
                color: "#777",
                backgroundColor: "#eceae4",
                border: "1px solid #dddbd5",
                padding: "6px 16px",
                borderRadius: "100px",
                letterSpacing: "0.01em",
              }}
            >
              {feat}
            </span>
          ))}
        </motion.div>

        <motion.div
          {...fadeUp(0.54)}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            width: "100%",
            maxWidth: "560px",
            marginTop: "5rem",
            borderTop: "1px solid #dddbd5",
            borderBottom: "1px solid #dddbd5",
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "2rem 0",
                borderRight: i < STATS.length - 1 ? "1px solid #dddbd5" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "2.6rem",
                  fontWeight: 400,
                  color: "#111",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {stat.value}
                <span style={{ color: "#aaa", fontSize: "2rem" }}>+</span>
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#888",
                  marginTop: "6px",
                  letterSpacing: "0.02em",
                }}
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