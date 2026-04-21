import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./redux/store.js";
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

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/events" element={<EventsPage />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/club-dashboard" element={<ClubAdminDashboard />} />
            <Route path="/attendance/:eventId" element={<AttendancePage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
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