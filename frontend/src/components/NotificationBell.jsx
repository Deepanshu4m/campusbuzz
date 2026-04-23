import { useState } from "react";
import { useSelector } from "react-redux";
import useSocket from "../utils/useSocket.js";

function NotificationBell() {
  const user = useSelector((state) => state.auth.user);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useSocket(user?._id, (data) => {
    setNotifications((prev) => [data, ...prev]);
    setUnread((prev) => prev + 1);
  });

  const handleOpen = () => {
    setOpen((prev) => !prev);
    setUnread(0); 
  };

  if (!user || user.role === "student") return null;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative text-gray-500 hover:text-indigo-600 transition cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Notifications</p>
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <li className="px-4 py-4 text-sm text-gray-400 text-center">
                No notifications yet
              </li>
            ) : (
              notifications.map((n, i) => (
                <li key={i} className="px-4 py-3">
                  <p className="text-sm text-gray-700">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.timestamp).toLocaleTimeString("en-IN", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;