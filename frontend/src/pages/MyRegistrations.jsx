import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/axios.js";
import QRDisplay from "../components/QRDisplay.jsx";
import { RegistrationCardSkeleton } from "../components/ui/Skeleton.jsx";

const BADGE_META = {
  first_event: { label: "First Event", emoji: "🎉", desc: "Attended your first event" },
  regular: { label: "Regular", emoji: "⭐", desc: "Attended 3 events" },
  enthusiast: { label: "Enthusiast", emoji: "🔥", desc: "Attended 5 events" },
};

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [regRes, badgeRes] = await Promise.all([
        api.get("/registrations/my"),
        api.get("/auth/me/badges"),
      ]);
      setRegistrations(regRes.data.data);
      setBadges(badgeRes.data.data.badges);
    } catch (err) {
      console.error("Failed to fetch data", err);
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

  const toggleQR = (id) => setExpandedId(expandedId === id ? null : id);

  const handleDownloadCertificate = async (registrationId, eventTitle) => {
    setDownloadingId(registrationId);
    try {
      const res = await api.get(`/certificates/${registrationId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate-${eventTitle.replace(/\s+/g, "-")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not download. Make sure the event is marked completed.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-indigo-600">CampusBuzz</h1>
        <Link to="/events" className="text-sm text-indigo-500 hover:underline font-medium">
          Browse Events
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">My Badges</h2>
          <p className="text-sm text-gray-400 mb-4">Earned by attending events</p>

          {loading ? (
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-24 w-28" />
              ))}
            </div>
          ) : badges.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl px-6 py-5 text-center">
              <p className="text-sm text-gray-400">No badges yet — attend events to earn them!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => {
                const meta = BADGE_META[badge] || { label: badge, emoji: "🏅", desc: "" };
                return (
                  <div
                    key={badge}
                    className="bg-white border border-indigo-100 rounded-2xl px-4 py-3 flex flex-col items-center gap-1 shadow-sm min-w-[100px]"
                  >
                    <span className="text-2xl">{meta.emoji}</span>
                    <span className="text-xs font-semibold text-gray-800">{meta.label}</span>
                    <span className="text-xs text-gray-400 text-center">{meta.desc}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Registrations</h2>
        
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <RegistrationCardSkeleton key={i} />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-3">You haven't registered for any events yet.</p>
            <Link to="/events" className="text-indigo-500 text-sm font-medium hover:underline">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {registrations.map((reg) => (
              <div key={reg._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{reg.event?.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(reg.event?.date)} · {reg.event?.venue}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reg.attended ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                        }`}>
                        {reg.attended ? "Attended ✓" : "Not attended yet"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reg.event?.status === "upcoming" ? "bg-indigo-50 text-indigo-500" : "bg-gray-100 text-gray-500"
                        }`}>
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

                {reg.attended && reg.event?.status === "completed" && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => handleDownloadCertificate(reg._id, reg.event?.title)}
                      disabled={downloadingId === reg._id}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                    >
                      {downloadingId === reg._id ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Generating...
                        </>
                      ) : "Download Certificate"}
                    </button>
                  </div>
                )}

                {expandedId === reg._id && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <QRDisplay qrCode={reg.qrCode} eventTitle={reg.event?.title} />
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