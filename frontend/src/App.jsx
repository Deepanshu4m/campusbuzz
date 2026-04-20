import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import MyRegistrations from "./pages/MyRegistrations.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ClubAdminDashboard from "./pages/ClubAdminDashboard.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/events" element={<EventsPage />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/club-dashboard" element={<ClubAdminDashboard />} />
            <Route path="/attendance/:eventId" element={<AttendancePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;