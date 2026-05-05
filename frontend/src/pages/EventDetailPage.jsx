import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../utils/axios.js";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data.data);

        if (user) {
          try {
            const myRegsRes = await api.get("/registrations/my");
            setAlreadyRegistered(myRegsRes.data.data.some((r) => r.event._id === id));
          } catch {
          }
        }
      } catch {
        toast.error("Event not found");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setLightboxOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await api.post(`/registrations/${id}/register`);
      toast.success("Registered! Check your email for the QR code.");
      setAlreadyRegistered(true);
      setEvent((prev) => ({ ...prev, registeredCount: prev.registeredCount + 1 }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const statusClass = (status) => {
    if (status === "upcoming") return "bg-green-50 text-green-600";
    if (status === "ongoing") return "bg-yellow-50 text-yellow-600";
    if (status === "cancelled") return "bg-red-50 text-red-500";
    return "bg-gray-100 text-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f5f4f0" }}>
        <nav className="bg-white h-16 px-10 flex items-center" style={{ borderBottom: "1px solid #e0dfd9" }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111" }}>CampusBuzz</span>
        </nav>
        <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-4">
          <div className="h-64 rounded-2xl animate-pulse" style={{ backgroundColor: "#e8e5de" }} />
          <div className="h-6 w-2/3 rounded-lg animate-pulse" style={{ backgroundColor: "#e8e5de" }} />
          <div className="h-4 w-1/3 rounded-lg animate-pulse" style={{ backgroundColor: "#e8e5de" }} />
          <div className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: "#e8e5de" }} />
        </div>
      </div>
    );
  }

  const capacityPercent = Math.min(Math.round((event.registeredCount / event.capacity) * 100), 100);
  const isFull = event.registeredCount >= event.capacity;
  const isCancelled = event.status === "cancelled";
  const isClosed = !event.isOpen;
  const isDisabled = registering || alreadyRegistered || isFull || isClosed || isCancelled;

  const btnLabel = registering ? "Registering..."
    : alreadyRegistered ? "Already Registered ✓"
      : isCancelled ? "Event Cancelled"
        : isClosed ? "Registrations Closed"
          : isFull ? "Event Full"
            : "Register for this Event →";

  const hintText = alreadyRegistered ? "You're registered. Check My Registrations for your QR code."
    : isCancelled ? "This event has been cancelled by the organiser."
      : isFull ? "This event has reached full capacity."
        : isClosed ? "Registration window is closed."
          : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <nav className="bg-white flex items-center justify-between px-10 h-16" style={{ borderBottom: "1px solid #e0dfd9" }}>
        <Link to="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111", letterSpacing: "-0.01em", textDecoration: "none" }}>
          CampusBuzz
        </Link>
        <Link to="/events" className="text-sm" style={{ color: "#888", textDecoration: "none" }}>← Back to Events</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #e8e6e0" }}
        >
          {event.banner ? (
            <img
              src={event.banner}
              alt={event.title}
              className="w-full h-64 object-cover"
              style={{ cursor: "zoom-in" }}
              onClick={() => setLightboxOpen(true)}
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center" style={{ backgroundColor: "#f0ede6" }}>
              <span className="text-xs uppercase tracking-widest" style={{ color: "#ccc" }}>No Banner</span>
            </div>
          )}

          {lightboxOpen && (
            <div
              onClick={() => setLightboxOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 9999,
                backgroundColor: "rgba(0,0,0,0.85)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "zoom-out",
              }}
            >
              <img
                src={event.banner}
                alt={event.title}
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: "90vw", maxHeight: "90vh",
                  objectFit: "contain",
                  borderRadius: "12px",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                }}
              />
            </div>
          )}

          <div className="p-8 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6366f1", letterSpacing: "0.1em" }}>
                  {event.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${statusClass(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <h1 className="font-normal" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#111", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                {event.title}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: "#f8f7f3" }}>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#aaa", letterSpacing: "0.06em" }}>Date</p>
                <p className="text-sm font-semibold" style={{ color: "#111" }}>{formatDate(event.date)}</p>
                <p className="text-xs mt-0.5" style={{ color: "#999" }}>{formatTime(event.date)}</p>
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: "#f8f7f3" }}>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#aaa", letterSpacing: "0.06em" }}>Venue</p>
                <p className="text-sm font-semibold" style={{ color: "#111" }}>{event.venue}</p>
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: "#f8f7f3" }}>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#aaa", letterSpacing: "0.06em" }}>Organizer</p>
                <p className="text-sm font-semibold" style={{ color: "#111" }}>{event.createdBy?.name || "—"}</p>
                <p className="text-xs mt-0.5" style={{ color: "#999" }}>{event.createdBy?.email}</p>
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: "#f8f7f3" }}>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#aaa", letterSpacing: "0.06em" }}>Capacity</p>
                <p className="text-sm font-semibold" style={{ color: "#111" }}>{event.registeredCount} / {event.capacity}</p>
                <div className="w-full h-1 rounded-full mt-2" style={{ backgroundColor: "#e8e5de" }}>
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{ width: `${capacityPercent}%`, backgroundColor: capacityPercent >= 90 ? "#ef4444" : "#6366f1" }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#aaa", letterSpacing: "0.06em" }}>About this event</p>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#666" }}>{event.description}</p>
            </div>

            <div className="pt-4" style={{ borderTop: "1px solid #e8e6e0" }}>
              <button
                onClick={handleRegister}
                disabled={isDisabled}
                className="w-full py-3.5 text-sm font-medium rounded-full border-none transition"
                style={{
                  backgroundColor: "#111",
                  color: "#f5f4f0",
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  letterSpacing: "0.01em",
                }}
              >
                {btnLabel}
              </button>
              {hintText && (
                <p className="text-xs text-center mt-3" style={{ color: alreadyRegistered ? "#6366f1" : "#f87171" }}>
                  {hintText}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}