import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axios.js";
import toast from "react-hot-toast";

const CATEGORIES = ["General", "Technical", "Cultural", "Sports", "Workshop", "Hackathon", "Seminar"];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", date: "", venue: "", category: "General", capacity: 100 });
  const [banner, setBanner] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBanner = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBanner(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));
      if (banner) formData.append("banner", banner);
      await api.post("/events", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Event created!");
      navigate("/club-dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />

      <nav className="bg-white flex items-center justify-between px-10 h-16" style={{ borderBottom: "1px solid #e0dfd9" }}>
        <Link to="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111", letterSpacing: "-0.01em", textDecoration: "none" }}>
          CampusBuzz
        </Link>
        <Link to="/club-dashboard" className="text-sm" style={{ color: "#888", textDecoration: "none" }}>← Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="font-normal mb-1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: "#111", letterSpacing: "-0.03em" }}>
          Create Event
        </h1>
        <p className="text-sm mb-8" style={{ color: "#999", fontWeight: 300 }}>Fill in the details to publish a new event</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Event Title</label>
            <input
              type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Hackathon 2025" required
              className="w-full px-4 py-3 text-sm rounded-xl outline-none"
              style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} placeholder="What is this event about?" rows={4}
              className="w-full px-4 py-3 text-sm rounded-xl outline-none resize-y"
              style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Date & Time</label>
              <input
                type="datetime-local" name="date" value={form.date} onChange={handleChange} required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Capacity</label>
              <input
                type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Venue</label>
              <input
                type="text" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Seminar Hall A" required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Category</label>
              <select
                name="category" value={form.category} onChange={handleChange}
                className="w-full px-4 py-3 text-sm rounded-xl outline-none cursor-pointer"
                style={{ border: "1px solid #d0cfc9", backgroundColor: "#faf9f6", color: "#111", fontFamily: "'DM Sans', sans-serif", appearance: "none" }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase mb-2" style={{ color: "#555", letterSpacing: "0.04em" }}>Banner Image</label>
            <input type="file" accept="image/*" onChange={handleBanner} className="text-sm" style={{ color: "#666" }} />
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-44 object-cover rounded-xl mt-3 cursor-pointer" />
            ) : (
              <div className="w-full h-44 rounded-xl flex items-center justify-center mt-3" style={{ backgroundColor: "#f0ede6" }}>
                <span className="text-xs uppercase tracking-widest" style={{ color: "#ccc" }}>No image selected</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-medium rounded-full border-none cursor-pointer disabled:opacity-50 mt-2"
            style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em" }}
          >
            {loading ? "Publishing..." : "Publish Event →"}
          </button>
        </form>
      </div>
    </div>
  );
}