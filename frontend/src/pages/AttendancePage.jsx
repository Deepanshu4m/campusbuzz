import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/axios.js";
import QRScanner from "../components/QRScanner.jsx";

function AttendancePage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeTab, setActiveTab] = useState("scan");

  useEffect(() => {
    fetchEvent();
    fetchAttendees();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data.data);
    } catch (err) {
      console.error("Failed to fetch event", err);
    }
  };

  const fetchAttendees = async () => {
    try {
      const res = await api.get(`/attendance/${eventId}/list`);
      setAttendees(res.data.data);
    } catch (err) {
      console.error("Failed to fetch attendance list", err);
    } finally {
      setLoadingList(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-indigo-600">CampusBuzz</h1>
        <Link to="/events" className="text-sm text-indigo-500 hover:underline font-medium">
          Back to Events
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {event ? event.title : "Loading event..."}
          </h2>
          {event && (
            <p className="text-sm text-gray-500 mt-1">
              {new Date(event.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · {event.venue}
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("scan")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "scan"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-400"
            }`}
          >
            Scan QR
          </button>
          <button
            onClick={() => {
              setActiveTab("list");
              fetchAttendees();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "list"
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-400"
            }`}
          >
            Attendance List ({attendees.length})
          </button>
        </div>

        {activeTab === "scan" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <QRScanner eventId={eventId} />
          </div>
        )}

        {activeTab === "list" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {loadingList ? (
              <p className="text-sm text-gray-400 text-center py-10">Loading...</p>
            ) : attendees.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No attendees marked yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {attendees.map((reg, i) => (
                  <div key={reg._id} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{reg.user?.name}</p>
                      <p className="text-xs text-gray-400">{reg.user?.email} · {reg.user?.usn}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {reg.attendedAt
                        ? new Date(reg.attendedAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendancePage;