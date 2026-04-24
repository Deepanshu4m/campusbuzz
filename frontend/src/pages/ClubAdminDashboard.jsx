import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../utils/axios.js";
import toast from "react-hot-toast";
import { AnalyticsRowSkeleton } from "../components/ui/Skeleton.jsx";

const CATEGORIES = ["General", "Technical", "Cultural", "Sports", "Workshop", "Hackathon", "Seminar"];

const confirmToast = (message, onConfirm) => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm">{message}</span>
      <div className="flex gap-2">
        <button
          onClick={() => { toast.dismiss(t.id); onConfirm(); }}
          className="px-3 py-1 text-white text-xs font-medium rounded-full border-none cursor-pointer"
          style={{ backgroundColor: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}
        >
          Delete
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 text-xs rounded-full border-none cursor-pointer"
          style={{ backgroundColor: "#f0ede6", color: "#555", fontFamily: "'DM Sans', sans-serif" }}
        >
          Cancel
        </button>
      </div>
    </div>
  ), { duration: 8000 });
};

const statusClass = (status) => {
  if (status === "upcoming") return "bg-green-50 text-green-600";
  if (status === "ongoing") return "bg-yellow-50 text-yellow-600";
  if (status === "cancelled") return "bg-red-50 text-red-500";
  return "bg-gray-100 text-gray-500";
};

export default function ClubAdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editBanner, setEditBanner] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user || (user.role !== "club_admin" && user.role !== "super_admin")) navigate("/events");
  }, [user]);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/my-events-analytics");
      setEvents(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const openEdit = (ev) => {
    setEditingEvent(ev);
    setEditForm({
      title: ev.title,
      description: ev.description || "",
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "",
      venue: ev.venue,
      category: ev.category || "General",
      capacity: ev.capacity,
    });
    setEditBanner(null);
    setEditPreview(null);
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditBanner = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditBanner(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, val]) => formData.append(key, val));
      if (editBanner) formData.append("banner", editBanner);
      await api.patch(`/events/${editingEvent._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Event updated!");
      setEditingEvent(null);
      fetchAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (eventId, eventTitle) => {
    confirmToast(`Delete "${eventTitle}"? This cannot be undone.`, async () => {
      setDeletingId(eventId);
      try {
        await api.delete(`/events/${eventId}`);
        toast.success("Event deleted");
        setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
      } catch (err) {
        toast.error(err.response?.data?.message || "Delete failed");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const totalRegistrations = events.reduce((sum, ev) => sum + (ev.registeredCount || 0), 0);
  const totalAttendees = events.reduce((sum, ev) => sum + (ev.attendedCount || 0), 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <nav className="bg-white flex items-center justify-between px-10 h-16" style={{ borderBottom: "1px solid #e0dfd9" }}>
        <Link to="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111", letterSpacing: "-0.01em", textDecoration: "none" }}>
          CampusBuzz
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/create-event")}
            className="text-sm font-medium px-5 py-2 rounded-full border-none cursor-pointer"
            style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
          >
            + Create Event
          </button>
          <Link to="/events" className="text-sm" style={{ color: "#888", textDecoration: "none" }}>← Events</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-normal mb-1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#111", letterSpacing: "-0.03em" }}>
          My Dashboard
        </h1>
        <p className="text-sm mb-8" style={{ color: "#999", fontWeight: 300 }}>Manage your events and track performance</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: events.length, label: "Events created" },
            { value: totalRegistrations, label: "Total registrations" },
            { value: totalAttendees, label: "Total attendees" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6" style={{ border: "1px solid #e8e6e0" }}>
              <p className="font-normal" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.2rem", color: "#111", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {stat.value}
              </p>
              <p className="text-xs mt-1.5" style={{ color: "#aaa" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#aaa" }}>Your Events</p>

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => <AnalyticsRowSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-normal" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color: "#ccc" }}>No events yet.</p>
            <p className="text-sm mt-2" style={{ color: "#bbb" }}>Create your first event to get started.</p>
            <button
              onClick={() => navigate("/create-event")}
              className="mt-5 text-sm font-medium px-6 py-2.5 rounded-full border-none cursor-pointer"
              style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
            >
              + Create Event
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e8e6e0" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #f0ede6" }}>
                  {["Event", "Date", "Status", "Registered", "Attended", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-5 py-4" style={{ color: "#aaa", letterSpacing: "0.08em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id} className="hover:bg-gray-50 transition" style={{ borderBottom: "1px solid #f8f7f3" }}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold" style={{ color: "#111" }}>{ev.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{ev.category}</p>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: "#666" }}>{formatDate(ev.date)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClass(ev.status)}`}>{ev.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span className="font-semibold" style={{ color: "#111" }}>{ev.registeredCount}</span>
                      <span style={{ color: "#aaa" }}> / {ev.capacity}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: "#111" }}>{ev.attendedCount || 0}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-4">
                        <Link to={`/attendance/${ev._id}`} className="text-xs font-medium" style={{ color: "#6366f1", textDecoration: "none" }}>Attendance</Link>
                        <button onClick={() => openEdit(ev)} className="text-xs font-medium bg-transparent border-none cursor-pointer" style={{ color: "#555", fontFamily: "'DM Sans', sans-serif" }}>Edit</button>
                        <button
                          onClick={() => handleDelete(ev._id, ev.title)}
                          disabled={deletingId === ev._id}
                          className="text-xs font-medium bg-transparent border-none cursor-pointer disabled:opacity-50"
                          style={{ color: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {deletingId === ev._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingEvent && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-6 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setEditingEvent(null); }}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-lg overflow-y-auto p-8"
              style={{ border: "1px solid #e8e6e0", maxHeight: "90vh" }}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="font-normal mb-1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color: "#111", letterSpacing: "-0.03em" }}>
                Edit Event
              </h2>
              <p className="text-sm mb-7" style={{ color: "#999" }}>Update details for "{editingEvent.title}"</p>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Title</label>
                  <input
                    name="title" value={editForm.title} onChange={handleEditChange} required
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                    style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Description</label>
                  <textarea
                    name="description" value={editForm.description} onChange={handleEditChange}
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none resize-y"
                    style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif", minHeight: "100px" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Date & Time</label>
                    <input
                      type="datetime-local" name="date" value={editForm.date} onChange={handleEditChange} required
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                      style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Capacity</label>
                    <input
                      type="number" name="capacity" value={editForm.capacity} onChange={handleEditChange} min="1" required
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                      style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Venue</label>
                    <input
                      name="venue" value={editForm.venue} onChange={handleEditChange} required
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                      style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Category</label>
                    <select
                      name="category" value={editForm.category} onChange={handleEditChange}
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none cursor-pointer"
                      style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif", appearance: "none" }}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Banner Image</label>
                  <input type="file" accept="image/*" onChange={handleEditBanner} className="text-sm" style={{ color: "#666" }} />
                  {editPreview ? (
                    <img src={editPreview} alt="preview" className="w-full h-36 object-cover rounded-xl mt-3" />
                  ) : editingEvent.banner ? (
                    <img src={editingEvent.banner} alt="current" className="w-full h-36 object-cover rounded-xl mt-3" />
                  ) : (
                    <div className="w-full h-36 rounded-xl flex items-center justify-center mt-3" style={{ backgroundColor: "#f0ede6" }}>
                      <span className="text-xs" style={{ color: "#ccc" }}>No banner uploaded</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="flex-1 py-3 text-sm rounded-full cursor-pointer"
                    style={{ backgroundColor: "transparent", color: "#555", border: "1px solid #d0cfc9", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 py-3 text-sm font-medium rounded-full border-none cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {editLoading ? "Saving..." : "Save Changes →"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}