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

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <nav className="bg-white flex items-center justify-between px-10 h-16" style={{ borderBottom: "1px solid #e0dfd9" }}>
        <Link to="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111", letterSpacing: "-0.01em", textDecoration: "none" }}>
          CampusBuzz
        </Link>
        <Link to="/events" className="text-sm" style={{ color: "#888", textDecoration: "none" }}>← Back to Events</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-normal mb-1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#111", letterSpacing: "-0.03em" }}>
          Attendance
        </h1>
        <p className="text-sm mb-8" style={{ color: "#999", fontWeight: 300 }}>
          {event ? `${event.title} · ${formatDate(event.date)}` : "Loading event..."}
        </p>

        <div className="flex gap-2 mb-8">
          {["scan", "list"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 text-sm font-medium rounded-full cursor-pointer transition"
              style={activeTab === tab
                ? { backgroundColor: "#111", color: "#f5f4f0", border: "none", fontFamily: "'DM Sans', sans-serif" }
                : { backgroundColor: "transparent", color: "#555", border: "1px solid #d0cfc9", fontFamily: "'DM Sans', sans-serif" }
              }
            >
              {tab === "scan" ? "Scan QR" : `Attendee List (${attendees.length})`}
            </button>
          ))}
        </div>

        {activeTab === "scan" && (
          <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #e8e6e0" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#aaa" }}>Scan student QR code</p>
            <QRScanner eventId={eventId} onSuccess={fetchAttendees} />
          </div>
        )}

        {activeTab === "list" && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #e8e6e0" }}>
            {loadingList ? (
              <div className="flex flex-col gap-3 p-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ backgroundColor: "#f0ede6" }} />
                ))}
              </div>
            ) : attendees.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-normal" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", color: "#ccc" }}>No attendees yet.</p>
                <p className="text-sm mt-2" style={{ color: "#bbb" }}>Scan QR codes to mark attendance.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0ede6" }}>
                    {["Name", "USN", "Department", "Checked in at"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide px-5 py-4" style={{ color: "#aaa", letterSpacing: "0.08em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50 transition" style={{ borderBottom: "1px solid #f8f7f3" }}>
                      <td className="px-5 py-4 text-sm font-semibold" style={{ color: "#111" }}>{a.user?.name || "—"}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#666" }}>{a.user?.usn || "—"}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#666" }}>{a.user?.department || "—"}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#999" }}>
                        {new Date(a.attendedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendancePage;