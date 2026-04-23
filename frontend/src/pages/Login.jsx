import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setCredentials } from "../redux/slices/authSlice.js";
import api from "../utils/axios.js";

const S = {
  page: { minHeight: "100vh", backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column" },
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 40px", borderBottom: "1px solid #e0dfd9" },
  logo: { fontFamily: "'DM Serif Display', serif", fontSize: "1.2rem", color: "#111", letterSpacing: "-0.01em" },
  center: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" },
  card: { width: "100%", maxWidth: "420px" },
  eyebrow: { fontSize: "11px", fontWeight: 500, letterSpacing: "0.16em", color: "#888", textTransform: "uppercase", marginBottom: "16px" },
  heading: { fontFamily: "'DM Serif Display', serif", fontSize: "2.4rem", fontWeight: 400, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "8px" },
  sub: { fontSize: "14px", color: "#888", fontWeight: 300, marginBottom: "36px" },
  label: { display: "block", fontSize: "12px", fontWeight: 500, color: "#555", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "8px" },
  input: { width: "100%", padding: "12px 16px", border: "1px solid #d0cfc9", borderRadius: "10px", fontSize: "14px", color: "#111", backgroundColor: "#faf9f6", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
  error: { padding: "12px 16px", border: "1px solid #f0c0b0", backgroundColor: "#fdf0eb", borderRadius: "10px", fontSize: "13px", color: "#a04020", marginBottom: "20px" },
  btn: { width: "100%", padding: "13px", backgroundColor: "#111", color: "#f5f4f0", border: "none", borderRadius: "100px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em", marginTop: "8px" },
  foot: { fontSize: "13px", color: "#888", textAlign: "center", marginTop: "28px" },
  link: { color: "#111", fontWeight: 500 },
  divider: { height: "1px", backgroundColor: "#e0dfd9", margin: "28px 0" },
};

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      dispatch(setCredentials(res.data.data));
      navigate("/events");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <nav style={S.nav}>
        <span style={S.logo}>CampusBuzz</span>
        <Link to="/" style={{ fontSize: "13px", color: "#888", textDecoration: "none" }}>← Home</Link>
      </nav>
      <div style={S.center}>
        <div style={S.card}>
          <p style={S.eyebrow}>NMIT · Campus Platform</p>
          <h1 style={S.heading}>Welcome<br /><span style={{ fontStyle: "italic", color: "#888" }}>back.</span></h1>
          <p style={S.sub}>Sign in to your CampusBuzz account</p>

          {error && <div style={S.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@nmit.ac.in" required />
            </div>
            <div>
              <label style={S.label}>Password</label>
              <input style={S.input} type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button style={{ ...S.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div style={S.divider} />
          <p style={S.foot}>
            Don't have an account?{" "}
            <Link to="/register" style={S.link}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;