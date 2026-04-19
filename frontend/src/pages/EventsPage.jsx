import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../redux/slices/authSlice.js";
import api from "../utils/axios.js";
import NotificationBell from "../components/NotificationBell.jsx";

function EventsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [message, setMessage] = useState({ id: null, text: "", success: false });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data.data.events);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId);
    setMessage({ id: null, text: "", success: false });

    try {
      await api.post(`/registrations/${eventId}/register`);
      setMessage({ id: eventId, text: "Registered successfully!", success: true });
    } catch (err) {
      setMessage({
        id: eventId,
        text: err.response?.data?.message || "Registration failed",
        success: false,
      });
    } finally {
      setRegisteringId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isMyEvent = (event) => {
    return event.createdBy?._id?.toString() === user?._id?.toString();
  };

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
            className="text-sm text-indigo-500 hover:underline font-medium"
          >
            My Registrations
          </Link>

          {(user?.role === "club_admin" || user?.role === "super_admin") && (
            <button
              onClick={() => navigate("/club-dashboard")}
              className="px-4 py-2 bg-indigo-50 border border-indigo-300 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 transition"
            >
              My Dashboard
            </button>
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Events</h2>

        {loading ? (
          <p className="text-sm text-gray-400">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-gray-400">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
              >
                {event.banner ? (
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="w-full h-40 object-cover"
                  />
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
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.status === "upcoming"
                          ? "bg-green-50 text-green-600"
                          : event.status === "ongoing"
                            ? "bg-yellow-50 text-yellow-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-xs text-gray-500 mb-1">{formatDate(event.date)} · {event.venue}</p>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{event.description}</p>

                  <div className="mt-auto flex flex-col gap-2">
                    {message.id === event._id && (
                      <p
                        className={`text-xs ${message.success ? "text-green-600" : "text-red-500"
                          }`}
                      >
                        {message.text}
                      </p>
                    )}

                    <button
                      onClick={() => handleRegister(event._id)}
                      disabled={
                        registeringId === event._id ||
                        !event.isOpen ||
                        event.registeredCount >= event.capacity
                      }
                      className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                      {registeringId === event._id
                        ? "Registering..."
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;