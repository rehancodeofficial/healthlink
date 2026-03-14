import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  // You might want to pull the URL from env vars
  // e.g. import.meta.env.VITE_BACKEND_URL or similar
  const backendUrl = "http://localhost:5001";

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(backendUrl, {
      withCredentials: true,
      // prevent auto-connect if you want to control it manually,
      // but auto-connect is fine for this context
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
