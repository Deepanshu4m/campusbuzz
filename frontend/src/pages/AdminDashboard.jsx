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
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <nav
        className="bg-white flex items-center justify-between px-10 h-16"
        style={{ borderBottom: "1px solid #e0dfd9" }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.2rem",
            color: "#111",
            letterSpacing: "-0.01em",
            textDecoration: "none",
          }}
        >
          CampusBuzz
        </Link>
        <Link to="/events" className="text-sm" style={{ color: "#888", textDecoration: "none" }}>
          ← Back to Events
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1
          className="font-normal mb-1"
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "2rem",
            color: "#111",
            letterSpacing: "-0.03em",
          }}
        >
          Admin Dashboard
        </h1>
        <p className="text-sm mb-8" style={{ color: "#999", fontWeight: 300 }}>
          Manage all users and events across CampusBuzz
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { value: totalUsers, label: "Total users" },
            { value: totalEvents, label: "Total events" },
            { value: totalRegistrations, label: "Total registrations" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-6"
              style={{ border: "1px solid #e8e6e0" }}
            >
              <p
                className="font-normal"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: "2.2rem",
                  color: "#111",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p className="text-xs mt-1.5" style={{ color: "#aaa" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {["users", "events"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-full text-sm font-medium transition cursor-pointer"
              style={
                activeTab === tab
                  ? { backgroundColor: "#111", color: "#f5f4f0", border: "none", fontFamily: "'DM Sans', sans-serif" }
                  : { backgroundColor: "transparent", color: "#555", border: "1px solid #d0cfc9", fontFamily: "'DM Sans', sans-serif" }
              }
            >
              {tab === "users" ? "Users" : "Events"}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <>
            <div
              className="hidden md:block bg-white rounded-2xl overflow-hidden"
              style={{ border: "1px solid #e8e6e0" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0ede6" }}>
                    {["Name", "Email", "Department", "Role"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold uppercase tracking-wide px-6 py-4"
                        style={{ color: "#aaa", letterSpacing: "0.08em" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRowSkeleton key={i} cols={4} />
                    ))
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-sm py-12" style={{ color: "#bbb" }}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-gray-50 transition"
                        style={{ borderBottom: "1px solid #f8f7f3" }}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold" style={{ color: "#111" }}>{u.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{u.usn || "—"}</p>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: "#555" }}>{u.email}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: "#555" }}>{u.department || "—"}</td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={roleUpdating === u._id}
                            className="text-sm rounded-lg px-3 py-1.5 cursor-pointer disabled:opacity-50 outline-none"
                            style={{
                              border: "1px solid #d0cfc9",
                              backgroundColor: "#faf9f6",
                              color: "#111",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
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

            <div className="flex flex-col gap-3 md:hidden">
              {loadingUsers ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: "#e8e5de" }} />
                ))
              ) : users.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: "#bbb" }}>No users found.</p>
              ) : (
                users.map((u) => (
                  <div
                    key={u._id}
                    className="bg-white rounded-2xl p-4 flex flex-col gap-3"
                    style={{ border: "1px solid #e8e6e0" }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#111" }}>{u.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{u.usn || "—"} · {u.department || "—"}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#888" }}>{u.email}</p>
                    </div>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={roleUpdating === u._id}
                      className="text-sm rounded-lg px-3 py-2 cursor-pointer disabled:opacity-50 outline-none w-full"
                      style={{
                        border: "1px solid #d0cfc9",
                        backgroundColor: "#faf9f6",
                        color: "#111",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "events" && (
          <>
            <div
              className="hidden md:block bg-white rounded-2xl overflow-hidden"
              style={{ border: "1px solid #e8e6e0" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0ede6" }}>
                    {["Event", "Date", "Registered", "Status"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold uppercase tracking-wide px-6 py-4"
                        style={{ color: "#aaa", letterSpacing: "0.08em" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingEvents ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRowSkeleton key={i} cols={4} />
                    ))
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-sm py-12" style={{ color: "#bbb" }}>
                        No events found.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => (
                      <tr
                        key={ev._id}
                        className="hover:bg-gray-50 transition"
                        style={{ borderBottom: "1px solid #f8f7f3" }}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold" style={{ color: "#111" }}>{ev.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{ev.category}</p>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: "#555" }}>{formatDate(ev.date)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-semibold" style={{ color: "#111" }}>{ev.registeredCount}</span>
                          <span style={{ color: "#aaa" }}> / {ev.capacity}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={ev.status}
                            onChange={(e) => handleStatusChange(ev._id, e.target.value)}
                            disabled={statusUpdating === ev._id}
                            className="text-sm rounded-lg px-3 py-1.5 cursor-pointer disabled:opacity-50 outline-none"
                            style={{
                              border: "1px solid #d0cfc9",
                              backgroundColor: "#faf9f6",
                              color: "#111",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
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

            <div className="flex flex-col gap-3 md:hidden">
              {loadingEvents ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: "#e8e5de" }} />
                ))
              ) : events.length === 0 ? (
                <p className="text-sm text-center py-10" style={{ color: "#bbb" }}>No events found.</p>
              ) : (
                events.map((ev) => (
                  <div
                    key={ev._id}
                    className="bg-white rounded-2xl p-4 flex flex-col gap-3"
                    style={{ border: "1px solid #e8e6e0" }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#111" }}>{ev.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#aaa" }}>{ev.category} · {formatDate(ev.date)}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#888" }}>
                        {ev.registeredCount} / {ev.capacity} registered
                      </p>
                    </div>
                    <select
                      value={ev.status}
                      onChange={(e) => handleStatusChange(ev._id, e.target.value)}
                      disabled={statusUpdating === ev._id}
                      className="text-sm rounded-lg px-3 py-2 cursor-pointer disabled:opacity-50 outline-none w-full"
                      style={{
                        border: "1px solid #d0cfc9",
                        backgroundColor: "#faf9f6",
                        color: "#111",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}