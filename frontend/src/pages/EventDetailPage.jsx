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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eventRes, myRegsRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get("/registrations/my"),
        ]);
        setEvent(eventRes.data.data);
        const registered = myRegsRes.data.data.some((r) => r.event._id === id);
        setAlreadyRegistered(registered);
      } catch {
        toast.error("Event not found");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

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
    new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const capacityPercent = event
    ? Math.min(Math.round((event.registeredCount / event.capacity) * 100), 100)
    : 0;

  const isFull = event && event.registeredCount >= event.capacity;
  const isClosed = event && !event.isOpen;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-4">
          <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-indigo-600">CampusBuzz</h1>
        <Link to="/events" className="text-sm text-indigo-500 hover:underline font-medium">
          ← Back to Events
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {event.banner ? (
            <img src={event.banner} alt={event.title} className="w-full h-64 object-cover" />
          ) : (
            <div className="w-full h-64 bg-indigo-50 flex items-center justify-center">
              <span className="text-indigo-200 text-sm">No banner</span>
            </div>
          )}

          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-indigo-500 font-semibold uppercase tracking-wide">
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
                <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(event.date)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatTime(event.date)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Venue</p>
                <p className="text-sm font-semibold text-gray-800">{event.venue}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Organizer</p>
                <p className="text-sm font-semibold text-gray-800">{event.createdBy?.name || "—"}</p>
                <p className="text-xs text-gray-400">{event.createdBy?.email}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Registrations</p>
                <p className="text-sm font-semibold text-gray-800">
                  {event.registeredCount} / {event.capacity}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      capacityPercent >= 90 ? "bg-red-400" : "bg-indigo-500"
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">About this event</h3>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <button
                onClick={handleRegister}
                disabled={registering || alreadyRegistered || isFull || isClosed}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
              >
                {registering
                  ? "Registering..."
                  : alreadyRegistered
                  ? "Already Registered ✓"
                  : isClosed
                  ? "Registrations Closed"
                  : isFull
                  ? "Event Full"
                  : "Register for this Event"}
              </button>
              {alreadyRegistered && (
                <p className="text-xs text-center text-indigo-400 mt-2">
                  You're registered. Check My Registrations for your QR code.
                </p>
              )}
              {isFull && !alreadyRegistered && (
                <p className="text-xs text-center text-red-400 mt-2">
                  This event has reached full capacity.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}