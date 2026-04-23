import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios.js";
import { TableRowSkeleton } from "../components/ui/Skeleton.jsx";

const ROLES = ["student", "club_admin", "super_admin"];
const STATUSES = ["upcoming", "ongoing", "completed", "cancelled"];

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
    if (!user || user.role !== "super_admin") {
      navigate("/events");
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6">Super Admin Dashboard</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === "users"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === "events"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-indigo-300 text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => navigate("/events")}
            className="ml-auto px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            ← Back to Events
          </button>
        </div>

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 text-indigo-700">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">USN</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.usn || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === "super_admin"
                            ? "bg-red-100 text-red-600"
                            : u.role === "club_admin"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          disabled={roleUpdating === u._id || u._id === user?._id}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 cursor-pointer"
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
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 text-indigo-700">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Venue</th>
                  <th className="text-left px-4 py-3">Created By</th>
                  <th className="text-left px-4 py-3">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingEvents ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : (
                  events.map((ev) => (
                    <tr key={ev._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{ev.title}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(ev.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{ev.venue || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{ev.createdBy?.name || "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={ev.status || "upcoming"}
                          disabled={statusUpdating === ev._id}
                          onChange={(e) => handleStatusChange(ev._id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
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