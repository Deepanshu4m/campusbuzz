import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { store } from "./redux/store.js";
import { fetchCurrentUser } from "./redux/slices/authSlice.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Hero from "./pages/Hero.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import MyRegistrations from "./pages/MyRegistrations.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ClubAdminDashboard from "./pages/ClubAdminDashboard.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import CreateEventPage from "./pages/CreateEventPage.jsx";
import EventDetailPage from "./pages/EventDetailPage.jsx";
import NotFound from "./pages/NotFound.jsx";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
};

function PageWrapper({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Hero /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/events" element={<PageWrapper><EventsPage /></PageWrapper>} />
          <Route path="/my-registrations" element={<PageWrapper><MyRegistrations /></PageWrapper>} />
          <Route path="/events/:id" element={<PageWrapper><EventDetailPage /></PageWrapper>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["club_admin", "super_admin"]} />}>
          <Route path="/club-dashboard" element={<PageWrapper><ClubAdminDashboard /></PageWrapper>} />
          <Route path="/attendance/:eventId" element={<PageWrapper><AttendancePage /></PageWrapper>} />
          <Route path="/create-event" element={<PageWrapper><CreateEventPage /></PageWrapper>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
          <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        </Route>

        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function AppInner() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) dispatch(fetchCurrentUser());
  }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}


function App() {
  return (
    <Provider store={store}>
      <AppInner />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "10px",
            background: "#1e1e2e",
            color: "#e2e8f0",
            fontSize: "14px",
          },
        }}
      />
    </Provider>
  );
}

export default App;