import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axios.js";

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

  useEffect(() => {
    if (!user || (user.role !== "club_admin" && user.role !== "super_admin")) {
      navigate("/events");
    }
  }, [user]);

  useEffect(() => {
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
    fetchAnalytics();
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

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
            <Link to="/events" className="text-indigo-500 text-sm font-medium hover:underline">
              Go to Events
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
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

                  <Link
                    to={`/attendance/${ev._id}`}
                    className="shrink-0 text-xs border border-indigo-300 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                  >
                    Manage Attendance
                  </Link>
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
    </div>
  );
}