import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { logout } from "../redux/slices/authSlice.js";
import api from "../utils/axios.js";
import NotificationBell from "../components/NotificationBell.jsx";
import { EventCardSkeleton } from "../components/ui/Skeleton.jsx";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" },
  }),
};

function EventsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [events, setEvents] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeStatus, setActiveStatus] = useState("");

  useEffect(() => { fetchAll(activeCategory, activeStatus); }, [activeCategory, activeStatus]);

  useEffect(() => {
    if (user) {
      api.get("/auth/me/badges")
        .then((res) => setBadgeCount(res.data.data.badges.length))
        .catch(() => { });
    }
  }, [user]);

  const fetchAll = async (category = "", status = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (status) params.append("status", status);

      const [eventsRes, myRegsRes] = await Promise.all([
        api.get(`/events?${params.toString()}`),
        api.get("/registrations/my"),
      ]);
      setEvents(eventsRes.data.data.events);
      const ids = new Set(myRegsRes.data.data.map((r) => r.event._id));
      setRegisteredEventIds(ids);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId);
    try {
      await api.post(`/registrations/${eventId}/register`);
      toast.success("Registered! Check your email for the QR code.");
      setRegisteredEventIds((prev) => new Set([...prev, eventId]));
      setEvents((prev) =>
        prev.map((ev) => ev._id === eventId ? { ...ev, registeredCount: ev.registeredCount + 1 } : ev)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleLogout = () => { dispatch(logout()); navigate("/"); };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const isMyEvent = (event) => event.createdBy?._id?.toString() === user?._id?.toString();
  const canManageAttendance = (event) => {
    if (user?.role === "super_admin") return true;
    if (user?.role === "club_admin" && isMyEvent(event)) return true;
    return false;
  };

  const statusClass = (status) => {
    if (status === "upcoming") return "bg-green-50 text-green-600";
    if (status === "ongoing") return "bg-yellow-50 text-yellow-600";
    if (status === "cancelled") return "bg-red-50 text-red-500";
    return "bg-gray-100 text-gray-500";
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <nav className="bg-white flex items-center justify-between px-10 h-16" style={{ borderBottom: "1px solid #e0dfd9" }}>
        <Link to="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111", letterSpacing: "-0.01em", textDecoration: "none" }}>
          CampusBuzz
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NotificationBell />

          <Link to="/my-registrations" className="text-sm relative" style={{ color: "#666", textDecoration: "none" }}>
            My Registrations
            {badgeCount > 0 && (
              <span className="absolute -top-2 -right-4 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#6366f1" }}>
                {badgeCount}
              </span>
            )}
          </Link>

          <span className="text-sm" style={{ color: "#bbb" }}>Hi, {user?.name?.split(" ")[0]}</span>

          {(user?.role === "club_admin" || user?.role === "super_admin") && (
            <>
              <button
                onClick={() => navigate("/club-dashboard")}
                className="text-sm px-5 py-2 rounded-full cursor-pointer"
                style={{ color: "#555", backgroundColor: "transparent", border: "1px solid #d0cfc9", fontFamily: "'DM Sans', sans-serif" }}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/create-event")}
                className="text-sm font-medium px-5 py-2 rounded-full cursor-pointer border-none"
                style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
              >
                + Create Event
              </button>
            </>
          )}

          {user?.role === "super_admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="text-sm px-5 py-2 rounded-full cursor-pointer"
              style={{ color: "#555", backgroundColor: "transparent", border: "1px solid #c7d2fe", fontFamily: "'DM Sans', sans-serif" }}
            >
              Admin
            </button>
          )}

          <button
            onClick={handleLogout}
            className="text-sm cursor-pointer bg-transparent border-none"
            style={{ color: "#999", fontFamily: "'DM Sans', sans-serif" }}
          >
            Logout
          </button>
        </div>

        <button onClick={() => setMenuOpen((p) => !p)} className="md:hidden flex flex-col gap-1.5 p-1 bg-transparent border-none cursor-pointer">
          <span className={`block w-5 h-0.5 bg-gray-600 transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-white flex flex-col gap-4 px-6 py-5" style={{ borderBottom: "1px solid #e0dfd9" }}>
          <span className="text-sm" style={{ color: "#888" }}>Hi, {user?.name?.split(" ")[0]}</span>
          <Link to="/my-registrations" onClick={() => setMenuOpen(false)} className="text-sm font-medium" style={{ color: "#6366f1", textDecoration: "none" }}>
            My Registrations {badgeCount > 0 && `(${badgeCount})`}
          </Link>
          {(user?.role === "club_admin" || user?.role === "super_admin") && (
            <>
              <button onClick={() => { navigate("/create-event"); setMenuOpen(false); }} className="text-left text-sm font-medium bg-transparent border-none cursor-pointer" style={{ color: "#111", fontFamily: "'DM Sans', sans-serif" }}>+ Create Event</button>
              <button onClick={() => { navigate("/club-dashboard"); setMenuOpen(false); }} className="text-left text-sm bg-transparent border-none cursor-pointer" style={{ color: "#555", fontFamily: "'DM Sans', sans-serif" }}>Dashboard</button>
            </>
          )}
          {user?.role === "super_admin" && (
            <button onClick={() => { navigate("/admin"); setMenuOpen(false); }} className="text-left text-sm bg-transparent border-none cursor-pointer" style={{ color: "#6366f1", fontFamily: "'DM Sans', sans-serif" }}>Admin Dashboard</button>
          )}
          <button onClick={handleLogout} className="text-left text-sm bg-transparent border-none cursor-pointer" style={{ color: "#999", fontFamily: "'DM Sans', sans-serif" }}>Logout</button>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="font-normal mb-1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#111", letterSpacing: "-0.03em" }}>
          Upcoming Events
        </h2>
        <p className="text-sm mb-6" style={{ color: "#999", fontWeight: 300 }}>
          Discover and register for events across all clubs at NMIT
        </p>

        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap gap-2">
            {["", "General", "Technical", "Cultural", "Sports", "Workshop", "Hackathon", "Seminar"].map((cat) => (
              <button
                key={cat || "all-cat"}
                onClick={() => setActiveCategory(cat)}
                className="text-xs px-4 py-1.5 rounded-full cursor-pointer transition"
                style={
                  activeCategory === cat
                    ? { backgroundColor: "#111", color: "#f5f4f0", border: "none", fontFamily: "'DM Sans', sans-serif" }
                    : { backgroundColor: "transparent", color: "#666", border: "1px solid #d0cfc9", fontFamily: "'DM Sans', sans-serif" }
                }
              >
                {cat || "All Categories"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {["", "upcoming", "ongoing", "completed", "cancelled"].map((st) => (
              <button
                key={st || "all-status"}
                onClick={() => setActiveStatus(st)}
                className="text-xs px-4 py-1.5 rounded-full cursor-pointer transition"
                style={
                  activeStatus === st
                    ? { backgroundColor: "#111", color: "#f5f4f0", border: "none", fontFamily: "'DM Sans', sans-serif" }
                    : { backgroundColor: "transparent", color: "#666", border: "1px solid #d0cfc9", fontFamily: "'DM Sans', sans-serif" }
                }
              >
                {st || "All Statuses"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-normal" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color: "#ccc" }}>No events yet.</p>
            <p className="text-sm mt-2" style={{ color: "#bbb" }}>Check back soon — clubs are planning something.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => {
              const alreadyRegistered = registeredEventIds.has(event._id);
              const isFull = event.registeredCount >= event.capacity;
              const isClosed = !event.isOpen;

              return (
                <motion.div
                  key={event._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-2xl flex flex-col overflow-hidden"
                  style={{ border: "1px solid #e8e6e0" }}
                >
                  {event.banner ? (
                    <img src={event.banner} alt={event.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center" style={{ backgroundColor: "#f0ede6" }}>
                      <span className="text-xs uppercase tracking-widest" style={{ color: "#ccc" }}>No Banner</span>
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6366f1", letterSpacing: "0.1em" }}>
                        {event.category}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${statusClass(event.status)}`}>
                        {event.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold mb-1" style={{ color: "#111" }}>{event.title}</h3>
                    <p className="text-xs mb-1" style={{ color: "#999" }}>{formatDate(event.date)} · {event.venue}</p>
                    <p className="text-xs mb-4 line-clamp-2" style={{ color: "#bbb", lineHeight: 1.6 }}>{event.description}</p>

                    <div className="mt-auto flex flex-col gap-2">
                      <Link
                        to={`/events/${event._id}`}
                        className="w-full flex items-center justify-center py-2.5 text-sm rounded-full transition hover:opacity-80"
                        style={{ color: "#555", border: "1px solid #d0cfc9", textDecoration: "none" }}
                      >
                        View Details →
                      </Link>

                      <button
                        onClick={() => handleRegister(event._id)}
                        disabled={alreadyRegistered || registeringId === event._id || isClosed || isFull}
                        className="w-full py-2.5 text-sm font-medium rounded-full border-none cursor-pointer transition"
                        style={{
                          backgroundColor: "#111",
                          color: "#f5f4f0",
                          fontFamily: "'DM Sans', sans-serif",
                          opacity: (alreadyRegistered || isClosed || isFull) ? 0.5 : 1,
                          cursor: (alreadyRegistered || isClosed || isFull) ? "not-allowed" : "pointer",
                        }}
                      >
                        {registeringId === event._id ? "Registering..." : alreadyRegistered ? "Registered ✓" : isClosed ? "Closed" : isFull ? "Full" : "Register"}
                      </button>

                      {canManageAttendance(event) && (
                        <Link
                          to={`/attendance/${event._id}`}
                          className="w-full flex items-center justify-center py-2.5 text-sm rounded-full transition hover:opacity-80"
                          style={{ color: "#6366f1", border: "1px solid #c7d2fe", textDecoration: "none" }}
                        >
                          Manage Attendance
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;