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

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (user) {
      api.get("/auth/me/badges")
        .then((res) => setBadgeCount(res.data.data.badges.length))
        .catch(() => {});
    }
  }, [user]);

  const fetchAll = async () => {
    try {
      const [eventsRes, myRegsRes] = await Promise.all([
        api.get("/events"),
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
        prev.map((ev) =>
          ev._id === eventId
            ? { ...ev, registeredCount: ev.registeredCount + 1 }
            : ev
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setRegisteringId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const isMyEvent = (event) =>
    event.createdBy?._id?.toString() === user?._id?.toString();

  const canManageAttendance = (event) => {
    if (user?.role === "super_admin") return true;
    if (user?.role === "club_admin" && isMyEvent(event)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-indigo-600">CampusBuzz</h1>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden flex flex-col gap-1.5 p-1"
          >
            <span className={`block w-5 h-0.5 bg-gray-600 transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-gray-600 transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

          <div className="hidden md:flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-gray-500">Hi, {user?.name}</span>

            <Link
              to="/my-registrations"
              className="relative text-sm text-indigo-500 hover:underline font-medium"
            >
              My Registrations
              {badgeCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {badgeCount}
                </span>
              )}
            </Link>

            {(user?.role === "club_admin" || user?.role === "super_admin") && (
              <>
                <button
                  onClick={() => navigate("/create-event")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition font-medium"
                >
                  + Create Event
                </button>
                <button
                  onClick={() => navigate("/club-dashboard")}
                  className="px-4 py-2 bg-indigo-50 border border-indigo-300 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition"
                >
                  My Dashboard
                </button>
              </>
            )}

            {user?.role === "super_admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                Admin Dashboard
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-3 pb-2 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Hi, {user?.name}</span>
              <NotificationBell />
            </div>

            <Link
              to="/my-registrations"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-indigo-500 font-medium"
            >
              My Registrations {badgeCount > 0 && `(${badgeCount})`}
            </Link>

            {(user?.role === "club_admin" || user?.role === "super_admin") && (
              <>
                <button
                  onClick={() => { navigate("/create-event"); setMenuOpen(false); }}
                  className="text-left text-sm text-indigo-600 font-medium"
                >
                  + Create Event
                </button>
                <button
                  onClick={() => { navigate("/club-dashboard"); setMenuOpen(false); }}
                  className="text-left text-sm text-indigo-600 font-medium"
                >
                  My Dashboard
                </button>
              </>
            )}

            {user?.role === "super_admin" && (
              <button
                onClick={() => { navigate("/admin"); setMenuOpen(false); }}
                className="text-left text-sm text-indigo-600 font-medium"
              >
                Admin Dashboard
              </button>
            )}

            <button
              onClick={handleLogout}
              className="text-left text-sm text-red-400 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Events</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-400">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => {
              const alreadyRegistered = registeredEventIds.has(event._id);
              return (
                <motion.div
                  key={event._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
                >
                  {event.banner ? (
                    <img src={event.banner} alt={event.title} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-indigo-50 flex items-center justify-center">
                      <span className="text-indigo-300 text-sm">No banner</span>
                    </div>
                  )}

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-indigo-500 font-medium uppercase tracking-wide">
                        {event.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        event.status === "upcoming" ? "bg-green-50 text-green-600"
                        : event.status === "ongoing" ? "bg-yellow-50 text-yellow-600"
                        : "bg-gray-100 text-gray-500"
                      }`}>
                        {event.status}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <p className="text-xs text-gray-500 mb-1">{formatDate(event.date)} · {event.venue}</p>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">{event.description}</p>

                    <div className="mt-auto flex flex-col gap-2">
                      <Link
                        to={`/events/${event._id}`}
                        className="w-full flex items-center justify-center py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition"
                      >
                        View Details →
                      </Link>

                      <button
                        onClick={() => handleRegister(event._id)}
                        disabled={
                          alreadyRegistered ||
                          registeringId === event._id ||
                          !event.isOpen ||
                          event.registeredCount >= event.capacity
                        }
                        className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                      >
                        {registeringId === event._id
                          ? "Registering..."
                          : alreadyRegistered
                          ? "Registered ✓"
                          : !event.isOpen
                          ? "Closed"
                          : event.registeredCount >= event.capacity
                          ? "Full"
                          : "Register"}
                      </button>

                      {canManageAttendance(event) && (
                        <Link
                          to={`/attendance/${event._id}`}
                          className="w-full flex items-center justify-center gap-1.5 border border-indigo-300 text-indigo-600 text-sm font-medium py-2 rounded-xl hover:bg-indigo-50 transition-colors"
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