import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { setCredentials } from "../redux/slices/authSlice.js";
import api from "../utils/axios.js";

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

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    usn: "",
    department: "Computer Science",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loginRes = await api.post("/auth/register", form);
      const loginResponse = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      dispatch(setCredentials(loginResponse.data.data));
      navigate("/events");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        <span
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "1.2rem",
            color: "#111",
            letterSpacing: "-0.01em",
          }}
        >
          CampusBuzz
        </span>
        <Link to="/" className="text-sm" style={{ color: "#888" }}>
          ← Home
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          <p
            className="text-xs font-medium uppercase mb-4"
            style={{ letterSpacing: "0.16em", color: "#888" }}
          >
            NMIT · Campus Platform
          </p>

          <h1
            className="mb-2"
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "2.4rem",
              fontWeight: 400,
              color: "#111",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Create your
            <br />
            <span style={{ fontStyle: "italic", color: "#888" }}>account.</span>
          </h1>

          <p className="text-sm mb-8" style={{ color: "#888", fontWeight: 300 }}>
            Join CampusBuzz to discover and register for events
          </p>

          {error && (
            <div
              className="mb-5 text-sm px-4 py-3 rounded-xl"
              style={{
                backgroundColor: "#fdf0eb",
                border: "1px solid #f0c0b0",
                color: "#a04020",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label
                className="block text-xs font-medium uppercase mb-2"
                style={{ letterSpacing: "0.04em", color: "#555" }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Deepanshu Bisht"
                required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={{
                  border: "1px solid #d0cfc9",
                  backgroundColor: "#faf9f6",
                  color: "#111",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium uppercase mb-2"
                style={{ letterSpacing: "0.04em", color: "#555" }}
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@nmit.ac.in"
                required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={{
                  border: "1px solid #d0cfc9",
                  backgroundColor: "#faf9f6",
                  color: "#111",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium uppercase mb-2"
                style={{ letterSpacing: "0.04em", color: "#555" }}
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={{
                  border: "1px solid #d0cfc9",
                  backgroundColor: "#faf9f6",
                  color: "#111",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-medium uppercase mb-2"
                  style={{ letterSpacing: "0.04em", color: "#555" }}
                >
                  USN
                </label>
                <input
                  type="text"
                  name="usn"
                  value={form.usn}
                  onChange={handleChange}
                  placeholder="1NT23CS056"
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                  style={{
                    border: "1px solid #d0cfc9",
                    backgroundColor: "#faf9f6",
                    color: "#111",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium uppercase mb-2"
                  style={{ letterSpacing: "0.04em", color: "#555" }}
                >
                  Department
                </label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none cursor-pointer"
                  style={{
                    border: "1px solid #d0cfc9",
                    backgroundColor: "#faf9f6",
                    color: "#111",
                    fontFamily: "'DM Sans', sans-serif",
                    appearance: "none",
                  }}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-medium rounded-full transition disabled:opacity-50 cursor-pointer mt-1"
              style={{
                backgroundColor: "#111",
                color: "#f5f4f0",
                letterSpacing: "0.01em",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div className="my-7" style={{ height: "1px", backgroundColor: "#e0dfd9" }} />

          <p className="text-sm text-center" style={{ color: "#888" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-medium" style={{ color: "#111" }}>
              Sign in
            </Link>
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