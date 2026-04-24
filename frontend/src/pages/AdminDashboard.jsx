import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axios.js";
import { TableRowSkeleton } from "../components/ui/Skeleton.jsx";

const ROLES = ["student", "club_admin", "super_admin"];
const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"];

const statusColor = (status) => {
  if (status === "completed") return "bg-gray-100 text-gray-600";
  if (status === "ongoing") return "bg-yellow-50 text-yellow-600";
  if (status === "cancelled") return "bg-red-50 text-red-500";
  return "bg-green-50 text-green-600";
};

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "super_admin") navigate("/events");
  }, [user]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else fetchEvents();
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await axiosInstance.get("/admin/events");
      setEvents(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setRoleUpdating(userId);
    try {
      await axiosInstance.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    setStatusUpdating(eventId);
    try {
      await axiosInstance.patch(`/admin/events/${eventId}/status`, { status: newStatus });
      setEvents((prev) =>
        prev.map((ev) => (ev._id === eventId ? { ...ev, status: newStatus } : ev))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const totalEvents = events.length;
  const totalUsers = users.length;
  const totalRegistrations = events.reduce((sum, ev) => sum + (ev.registeredCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-indigo-600">CampusBuzz</h1>
        <Link to="/events" className="text-sm text-indigo-500 hover:underline font-medium">
          ← Back to Events
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Admin Dashboard</h2>
        <p className="text-sm text-gray-400 mb-8">Manage all users and events across CampusBuzz</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            <p className="text-xs text-gray-400 mt-1">Total users</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
            <p className="text-xs text-gray-400 mt-1">Total events</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
            <p className="text-xs text-gray-400 mt-1">Total registrations</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {["users", "events"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-500"
              }`}
            >
              {tab === "users" ? "Users" : "Events"}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Name</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Email</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Department</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-sm text-gray-400 py-12">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.usn || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{u.department || "—"}</td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={roleUpdating === u._id}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer disabled:opacity-50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "events" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Event</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Registered</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-sm text-gray-400 py-12">No events found.</td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                        <p className="text-xs text-gray-400">{ev.category}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(ev.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span className="font-semibold text-gray-800">{ev.registeredCount}</span> / {ev.capacity}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ev.status}
                          onChange={(e) => handleStatusChange(ev._id, e.target.value)}
                          disabled={statusUpdating === ev._id}
                          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer disabled:opacity-50"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}