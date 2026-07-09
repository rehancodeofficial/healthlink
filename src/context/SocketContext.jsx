import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

import { SocketContext } from "./useSocket";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("disconnected"); // 'disconnected' | 'connecting' | 'connected' | 'reconnecting'
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Derive socket URL from API base URL (strip /api suffix)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
  const backendUrl = apiBaseUrl.replace(/\/api\/?$/, "");

  useEffect(() => {
    // Get user info from localStorage
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("userName") || localStorage.getItem("name") || "User";
    const token = localStorage.getItem("token");

    if (!userId || !role || !token) {
      console.warn("⚠️ No user credentials or token found. Socket connection delayed.");
      setConnectionState("disconnected");
      return;
    }

    setConnectionState("connecting");

    // Initialize socket connection with JWT auth
    const newSocket = io(backendUrl, {
      withCredentials: true,
      autoConnect: false, // Don't connect immediately
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    // Manually connect
    newSocket.connect();

    // Connection successful
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
      setConnectionState("connected");
      reconnectAttempts.current = 0;

      newSocket.emit("user_online", { userId, role, name });
    });

    // Connection error (Handles "Token expired" or "Authentication required")
    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      
      const isAuthError = 
        error.message === "Token expired" || 
        error.message === "Authentication required" || 
        error.message === "Invalid token";

      if (isAuthError) {
        console.warn("🔒 Auth error detected. Logging out...");
        
        // Stop reconnecting
        newSocket.disconnect();
        
        // Clear storage
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
          window.location.href = "/login?reason=session_expired";
        }
      } else {
        setIsConnected(false);
        setConnectionState("reconnecting");
      }
    });

    // Reconnect attempt
    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}/${maxReconnectAttempts}`);
      setConnectionState("reconnecting");
    });

    // Reconnect successful
    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionState("connected");
      reconnectAttempts.current = 0;
      newSocket.emit("user_online", { userId, role, name });
    });

    // Reconnect failed
    newSocket.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after maximum attempts");
      setIsConnected(false);
      setConnectionState("disconnected");
    });

    // Disconnected
    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsConnected(false);
      setConnectionState("disconnected");
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [backendUrl]);

  const contextValue = {
    socket,
    isConnected,
    connectionState,
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};
