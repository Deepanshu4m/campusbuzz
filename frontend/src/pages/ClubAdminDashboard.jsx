import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axios.js";
import toast from "react-hot-toast";

const CATEGORIES = ["General", "Technical", "Cultural", "Sports", "Workshop", "Hackathon", "Seminar"];

const statusColor = (status) => {
  if (status === "completed") return "bg-gray-100 text-gray-600";
  if (status === "ongoing") return "bg-blue-100 text-blue-600";
  if (status === "cancelled") return "bg-red-100 text-red-500";
  return "bg-green-100 text-green-700";
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
    if (!user || (user.role !== "club_admin" && user.role !== "super_admin")) {
      navigate("/events");
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

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
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

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

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

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

  const handleDelete = async (eventId, eventTitle) => {
    if (!window.confirm(`Delete "${eventTitle}"? This cannot be undone.`)) return;
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-indigo-600">CampusBuzz</h1>
        <Link to="/events" className="text-sm text-indigo-500 hover:underline font-medium">
          ← Back to Events
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Events</h2>
          <p className="text-sm text-gray-400 mt-1">Analytics for events you created</p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-3">You haven't created any events yet.</p>
            <Link to="/create-event" className="text-indigo-500 text-sm font-medium hover:underline">
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((ev) => (
              <div key={ev._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{ev.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(ev.status)}`}>
                        {ev.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(ev.date)} · {ev.venue}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(ev)}
                      className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ev._id, ev.title)}
                      disabled={deletingId === ev._id}
                      className="text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                    >
                      {deletingId === ev._id ? "Deleting..." : "Delete"}
                    </button>
                    <Link
                      to={`/attendance/${ev._id}`}
                      className="text-xs border border-indigo-300 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                    >
                      Attendance
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{ev.totalRegistrations}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Registered</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{ev.totalAttended}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Attended</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-500">{ev.capacity}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Capacity</p>
                  </div>
                </div>

                {ev.totalRegistrations > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Attendance rate</span>
                      <span>{Math.round((ev.totalAttended / ev.totalRegistrations) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.round((ev.totalAttended / ev.totalRegistrations) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingEvent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto max-h-[90vh] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">Edit Event</h3>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div
                onClick={() => document.getElementById("editBannerInput").click()}
                className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-indigo-300 transition overflow-hidden bg-gray-50"
              >
                {editPreview ? (
                  <img src={editPreview} className="w-full h-full object-cover" />
                ) : (
                  <p className="text-xs text-gray-400">Click to change banner</p>
                )}
              </div>
              <input id="editBannerInput" type="file" accept="image/*" onChange={handleEditBanner} className="hidden" />

              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                placeholder="Event Title"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows={3}
                placeholder="Description"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  name="date"
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  name="venue"
                  value={editForm.venue}
                  onChange={handleEditChange}
                  placeholder="Venue"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  name="capacity"
                  value={editForm.capacity}
                  onChange={handleEditChange}
                  min={1}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}