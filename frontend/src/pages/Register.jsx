import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/axios.js";
import toast from "react-hot-toast";

const DEPARTMENTS = [
  "Computer Science",
  "Information Science",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & ML",
  "Other",
];

const inputStyle = {
  border: "1px solid #d0cfc9",
  backgroundColor: "#faf9f6",
  color: "#111",
  fontFamily: "'DM Sans', sans-serif",
};

function Register() {
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    usn: "",
    department: "Computer Science",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/initiate-register", form);
      setOtpSent(true);
      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email: form.email, otp });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await api.post("/auth/initiate-register", form);
      toast.success("OTP resent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
    >
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
        <Link to="/" className="text-sm" style={{ color: "#888" }}>← Home</Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          <p className="text-xs font-medium uppercase mb-4" style={{ letterSpacing: "0.16em", color: "#888" }}>
            NMIT · Campus Platform
          </p>

          {!otpSent ? (
            <>
              <h1
                className="mb-2"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.4rem", fontWeight: 400, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Create your<br />
                <span style={{ fontStyle: "italic", color: "#888" }}>account.</span>
              </h1>
              <p className="text-sm mb-8" style={{ color: "#888", fontWeight: 300 }}>
                Join CampusBuzz to discover and register for events
              </p>

              <form onSubmit={handleRegister} className="flex flex-col gap-5">
                {[
                  { label: "Full Name", name: "name", type: "text", placeholder: "e.g. Deepanshu Bisht" },
                  { label: "Email", name: "email", type: "email", placeholder: "you@nmit.ac.in" },
                  { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
                ].map(({ label, name, type, placeholder }) => (
                  <div key={name}>
                    <label className="block text-xs font-medium uppercase mb-2" style={{ letterSpacing: "0.04em", color: "#555" }}>
                      {label}
                    </label>
                    <input
                      type={type} name={name} value={form[name]}
                      onChange={handleChange} placeholder={placeholder} required
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase mb-2" style={{ letterSpacing: "0.04em", color: "#555" }}>USN</label>
                    <input
                      type="text" name="usn" value={form.usn}
                      onChange={(e) => setForm({ ...form, usn: e.target.value.toUpperCase() })}
                      placeholder="1NT23CS056" required
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase mb-2" style={{ letterSpacing: "0.04em", color: "#555" }}>Department</label>
                    <select
                      name="department" value={form.department} onChange={handleChange} required
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none cursor-pointer"
                      style={{ ...inputStyle, appearance: "none" }}
                    >
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3 text-sm font-medium rounded-full transition disabled:opacity-50 cursor-pointer mt-1"
                  style={{ backgroundColor: "#111", color: "#f5f4f0", letterSpacing: "0.01em", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {loading ? "Sending OTP..." : "Continue →"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1
                className="mb-2"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.4rem", fontWeight: 400, color: "#111", letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Check your<br />
                <span style={{ fontStyle: "italic", color: "#888" }}>email.</span>
              </h1>
              <p className="text-sm mb-8" style={{ color: "#888", fontWeight: 300 }}>
                We sent a 6-digit code to <strong style={{ color: "#111" }}>{form.email}</strong>
              </p>

              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-medium uppercase mb-2" style={{ letterSpacing: "0.04em", color: "#555" }}>
                    Verification Code
                  </label>
                  <input
                    type="text" maxLength={6} value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000" required
                    className="w-full px-4 py-3 text-sm rounded-xl outline-none text-center"
                    style={{ ...inputStyle, fontSize: "1.8rem", letterSpacing: "0.5em" }}
                  />
                </div>

                <button
                  type="submit" disabled={loading || otp.length !== 6}
                  className="w-full py-3 text-sm font-medium rounded-full transition disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: "#111", color: "#f5f4f0", letterSpacing: "0.01em", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {loading ? "Verifying..." : "Verify & Create Account →"}
                </button>
              </form>

              <div className="mt-5 flex flex-col items-center gap-3">
                <button
                  onClick={handleResend} disabled={loading}
                  className="text-sm disabled:opacity-50"
                  style={{ color: "#6366F1", background: "none", border: "none", cursor: "pointer" }}
                >
                  Didn't get it? Resend OTP
                </button>
                <button
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="text-sm"
                  style={{ color: "#888", background: "none", border: "none", cursor: "pointer" }}
                >
                  ← Change details
                </button>
              </div>
            </>
          )}

          <div className="my-7" style={{ height: "1px", backgroundColor: "#e0dfd9" }} />
          <p className="text-sm text-center" style={{ color: "#888" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-medium" style={{ color: "#111" }}>Sign in</Link>
          </p>
          <p className="text-xs text-center mt-4" style={{ color: "#bbb" }}>
            All accounts register as students. Contact the admin to get club access.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;