import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

const useSocket = (userId, onNotification) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socketRef.current.emit("join", userId);

    socketRef.current.on("new_registration", (data) => {
      onNotification(data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);
};

export default useSocket;