import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axios.js";
import QRDisplay from "../components/QRDisplay.jsx";

function MyRegistrations() {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      const res = await api.get("/registrations/my");
      setRegistrations(res.data.data);
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const toggleQR = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-indigo-600">CampusBuzz</h1>
        <Link
          to="/events"
          className="text-sm text-indigo-500 hover:underline font-medium"
        >
          Browse Events
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Registrations</h2>

        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-3">You haven't registered for any events yet.</p>
            <Link
              to="/events"
              className="text-indigo-500 text-sm font-medium hover:underline"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {registrations.map((reg) => (
              <div
                key={reg._id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {reg.event?.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(reg.event?.date)} · {reg.event?.venue}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          reg.attended
                            ? "bg-green-50 text-green-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {reg.attended ? "Attended ✓" : "Not attended yet"}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          reg.event?.status === "upcoming"
                            ? "bg-indigo-50 text-indigo-500"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {reg.event?.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleQR(reg._id)}
                    className="text-xs text-indigo-500 hover:underline font-medium shrink-0 ml-4"
                  >
                    {expandedId === reg._id ? "Hide QR" : "Show QR"}
                  </button>
                </div>

                {expandedId === reg._id && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <QRDisplay
                      qrCode={reg.qrCode}
                      eventTitle={reg.event?.title}
                    />
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

export default MyRegistrations;