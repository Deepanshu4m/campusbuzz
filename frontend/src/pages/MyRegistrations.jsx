import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../utils/axios.js";
import QRDisplay from "../components/QRDisplay.jsx";
import { RegistrationCardSkeleton } from "../components/ui/Skeleton.jsx";

const BADGE_META = {
  first_event: { label: "First Event", emoji: "🎉", desc: "Attended your first event" },
  regular: { label: "Regular", emoji: "⭐", desc: "Attended 3 events" },
  enthusiast: { label: "Enthusiast", emoji: "🔥", desc: "Attended 5 events" },
};

const confirmToast = (message, onConfirm) => {
  toast((t) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm">{message}</span>
      <div className="flex gap-2">
        <button
          onClick={() => { toast.dismiss(t.id); onConfirm(); }}
          className="px-3 py-1 text-white text-xs font-medium rounded-full cursor-pointer border-none"
          style={{ backgroundColor: "#ef4444", fontFamily: "'DM Sans', sans-serif" }}
        >
          Cancel Registration
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 text-xs rounded-full cursor-pointer border-none"
          style={{ backgroundColor: "#f0ede6", color: "#555", fontFamily: "'DM Sans', sans-serif" }}
        >
          Keep
        </button>
      </div>
    </div>
  ), { duration: 8000 });
};

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

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
    new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

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

  const handleCancel = (eventId, eventTitle) => {
    confirmToast(`Cancel registration for "${eventTitle}"?`, async () => {
      setCancellingId(eventId);
      try {
        await api.delete(`/registrations/${eventId}/cancel`);
        toast.success("Registration cancelled.");
        setRegistrations((prev) => prev.filter((r) => r.event._id !== eventId));
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not cancel registration.");
      } finally {
        setCancellingId(null);
      }
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <nav className="bg-white flex items-center justify-between px-10 h-16" style={{ borderBottom: "1px solid #e0dfd9" }}>
        <Link to="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111", letterSpacing: "-0.01em", textDecoration: "none" }}>
          CampusBuzz
        </Link>
        <Link to="/events" className="text-sm" style={{ color: "#888", textDecoration: "none" }}>← Browse Events</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-normal mb-1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#111", letterSpacing: "-0.03em" }}>
          My Activity
        </h1>
        <p className="text-sm mb-10" style={{ color: "#999", fontWeight: 300 }}>Your registrations, badges, and certificates</p>

        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#aaa" }}>Badges</p>

        {loading ? (
          <div className="flex gap-3 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-28 h-24 rounded-2xl animate-pulse" style={{ backgroundColor: "#e8e5de" }} />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 mb-10">
            {Object.entries(BADGE_META).map(([key, meta]) => {
              const earned = badges.includes(key);
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl min-w-[110px]"
                  style={{
                    backgroundColor: earned ? "#fff" : "#f0ede6",
                    border: "1px solid #e8e6e0",
                    opacity: earned ? 1 : 0.45,
                    filter: earned ? "none" : "grayscale(1)",
                  }}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: "#111" }}>{meta.label}</span>
                  <span className="text-xs text-center" style={{ color: "#aaa", lineHeight: 1.4 }}>{meta.desc}</span>
                  {earned && <span className="text-xs font-semibold" style={{ color: "#6366f1" }}>✓ Earned</span>}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#aaa" }}>Registrations</p>

        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => <RegistrationCardSkeleton key={i} />)}
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-normal" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", color: "#ccc" }}>No registrations yet.</p>
            <p className="text-sm mt-2" style={{ color: "#bbb" }}>Browse events and register to see them here.</p>
            <Link to="/events" className="inline-block mt-5 text-sm font-medium" style={{ color: "#6366f1", textDecoration: "none" }}>Browse Events →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {registrations.map((reg) => {
              const canCancel = !reg.attended && reg.event?.status === "upcoming";
              const canDownload = reg.attended && reg.event?.status === "completed";
              const isExpanded = expandedId === reg._id;

              return (
                <motion.div
                  key={reg._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5"
                  style={{ border: "1px solid #e8e6e0" }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1" style={{ color: "#111" }}>{reg.event?.title}</p>
                      <p className="text-xs mb-2.5" style={{ color: "#999" }}>{formatDate(reg.event?.date)} · {reg.event?.venue}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${reg.attended ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                          {reg.attended ? "Attended ✓" : "Not attended"}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${reg.event?.status === "upcoming" ? "bg-indigo-50 text-indigo-500" : "bg-gray-100 text-gray-500"}`}>
                          {reg.event?.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleQR(reg._id)}
                      className="text-xs font-medium ml-4 bg-transparent border-none cursor-pointer shrink-0"
                      style={{ color: "#6366f1", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {isExpanded ? "Hide QR" : "Show QR"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        key="qr"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="mt-4 pt-4" style={{ borderTop: "1px solid #f0ede6" }}>
                          <QRDisplay qrCode={reg.qrCode} eventTitle={reg.event?.title} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {(canCancel || canDownload) && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid #f0ede6" }}>
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(reg.event._id, reg.event?.title)}
                          disabled={cancellingId === reg.event._id}
                          className="w-full py-2.5 text-sm font-medium rounded-full cursor-pointer transition"
                          style={{ backgroundColor: "transparent", color: "#ef4444", border: "1px solid #fca5a5", fontFamily: "'DM Sans', sans-serif", opacity: cancellingId === reg.event._id ? 0.5 : 1 }}
                        >
                          {cancellingId === reg.event._id ? "Cancelling..." : "Cancel Registration"}
                        </button>
                      )}
                      {canDownload && (
                        <button
                          onClick={() => handleDownloadCertificate(reg._id, reg.event?.title)}
                          disabled={downloadingId === reg._id}
                          className="w-full py-2.5 text-sm font-medium rounded-full border-none cursor-pointer flex items-center justify-center gap-2 transition"
                          style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif", opacity: downloadingId === reg._id ? 0.6 : 1 }}
                        >
                          {downloadingId === reg._id ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generating...
                            </>
                          ) : "Download Certificate →"}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRegistrations;