import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Hero() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleCTA = () => {
    navigate(isAuthenticated ? "/events" : "/login");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <span className="text-lg font-bold text-indigo-600">CampusBuzz</span>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/events")}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Events
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 font-medium transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          NMIT's Event Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl font-bold text-gray-900 leading-tight max-w-2xl"
        >
          Campus events,{" "}
          <span className="text-indigo-600">all in one place</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-base text-gray-500 max-w-lg leading-relaxed"
        >
          Discover, register, and attend events across all clubs at NMIT.
          Get QR-based entry, track attendance, and download certificates — all in one dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-center gap-4"
        >
          <button
            onClick={handleCTA}
            className="px-7 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
          >
            {isAuthenticated ? "Browse Events →" : "Get Started →"}
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/register")}
              className="px-7 py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition"
            >
              Create account
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-14 flex flex-wrap justify-center gap-3"
        >
          {[
            "QR-based check-in",
            "Role-based dashboards",
            "PDF certificates",
            "Real-time notifications",
            "Multi-club support",
          ].map((feat) => (
            <span
              key={feat}
              className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full"
            >
              {feat}
            </span>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

export default Hero;