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
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  const [badgeCount, setBadgeCount] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      api.get("/auth/me/badges")
        .then((res) => setBadgeCount(res.data.data.badges.length))
        .catch(() => {});
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data.data.events);
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
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-indigo-600">CampusBuzz</h1>

        <div className="flex items-center gap-4">
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

    </div>
  );
}

export default EventsPage;