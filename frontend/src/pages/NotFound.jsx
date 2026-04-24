import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
      />

      <p className="text-xs font-medium uppercase mb-6" style={{ letterSpacing: "0.16em", color: "#aaa" }}>
        404 · Page not found
      </p>

      <h1
        className="font-normal mb-3"
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(3rem, 7vw, 5.5rem)",
          color: "#111",
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
        }}
      >
        Lost in the{" "}
        <span style={{ fontStyle: "italic", color: "#aaa" }}>crowd.</span>
      </h1>

      <p className="text-sm mb-8" style={{ color: "#999", fontWeight: 300, maxWidth: "340px", lineHeight: 1.7 }}>
        This page doesn't exist. It may have been moved or the URL is wrong.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-6 py-2.5 rounded-full cursor-pointer"
          style={{ color: "#555", backgroundColor: "transparent", border: "1px solid #d0cfc9", fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Go back
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-medium px-6 py-2.5 rounded-full border-none cursor-pointer"
          style={{ backgroundColor: "#111", color: "#f5f4f0", fontFamily: "'DM Sans', sans-serif" }}
        >
          Home
        </button>
      </div>
    </div>
  );
}