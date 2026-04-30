import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/axios.js";
import toast from "react-hot-toast";

const inputStyle = {
  border: "1px solid #d0cfc9",
  backgroundColor: "#faf9f6",
  color: "#111",
  fontFamily: "'DM Sans', sans-serif",
};

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/auth/profile")
      .then((res) => {
        const u = res.data.data;
        setProfile(u);
        setName(u.name);
        setPhone(u.phone || "");
      })
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch("/auth/profile", { name, phone });
      const updated = res.data.data;
      setProfile(updated);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, phone: updated.phone }));
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f4f0" }}>
        <p style={{ color: "#888", fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <nav
        className="flex items-center justify-between px-10 py-5 bg-white"
        style={{ borderBottom: "1px solid #e0dfd9" }}
      >
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111", letterSpacing: "-0.01em" }}>
          CampusBuzz
        </span>
        <Link to="/events" className="text-sm" style={{ color: "#888" }}>← Back to Events</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          <p className="text-xs font-medium uppercase mb-4" style={{ letterSpacing: "0.16em", color: "#888" }}>
            Your Account
          </p>

          <h1
            className="mb-8"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.4rem", fontWeight: 400, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.1 }}
          >
            Your<br />
            <span style={{ fontStyle: "italic", color: "#888" }}>profile.</span>
          </h1>

          <div className="mb-8 flex flex-col gap-4">
            {[
              { label: "Email", value: profile.email },
              { label: "USN", value: profile.usn },
              { label: "Department", value: profile.department },
              { label: "Role", value: profile.role },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs font-medium uppercase mb-1" style={{ letterSpacing: "0.04em", color: "#999" }}>{label}</p>
                <p className="text-sm" style={{ color: "#444" }}>{value}</p>
              </div>
            ))}
          </div>

          <div style={{ height: "1px", backgroundColor: "#e0dfd9", marginBottom: "2rem" }} />

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium uppercase mb-2" style={{ letterSpacing: "0.04em", color: "#555" }}>Full Name</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase mb-2" style={{ letterSpacing: "0.04em", color: "#555" }}>Phone Number</label>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXXXXXXX"
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={inputStyle}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 text-sm font-medium rounded-full transition disabled:opacity-50 cursor-pointer mt-1"
              style={{ backgroundColor: "#111", color: "#f5f4f0", letterSpacing: "0.01em", fontFamily: "'DM Sans', sans-serif" }}
            >
              {loading ? "Saving..." : "Save Changes →"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;