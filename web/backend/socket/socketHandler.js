// FILE: backend/socket/socketHandler.js

// Store active users and their rooms
const activeUsers = new Map(); // socketId -> { userId, role, name, rooms: Set }
const roomUsers = new Map(); // roomId -> Set of socketIds

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // User registers with their identity
    socket.on("user_online", ({ userId, role, name }) => {
      activeUsers.set(socket.id, {
        userId,
        role,
        name,
        rooms: new Set(),
      });
      console.log(`👤 User online: ${name} (${role}) - Socket: ${socket.id}`);

      // Broadcast to all that user is online
      socket.broadcast.emit("user_status", {
        userId,
        role,
        name,
        status: "online",
      });
    });

    // Join a specific room (consultation/appointment ID)
    socket.on("join_room", async (data) => {
      const { roomId, appointmentId } = data;

      // Validate input
      if (!roomId || !appointmentId) {
        socket.emit("error", {
          code: "INVALID_DATA",
          message: "roomId and appointmentId are required",
        });
        return;
      }

      try {
        // Import Prisma client (add at top of file if needed)
        const { PrismaClient } = require("@prisma/client");
        const prisma = new PrismaClient();

        // Validate appointment exists and user has access
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        });

        if (!appointment) {
          socket.emit("error", {
            code: "APPOINTMENT_NOT_FOUND",
            message: "Appointment not found",
          });
          console.warn(
            `⚠️ Appointment not found: ${appointmentId} by socket ${socket.id}`,
          );
          return;
        }

        // Verify user is authorized (either doctor or patient)
        const isDoctorAuthorized = socket.userId === appointment.doctor.userId;
        const isPatientAuthorized =
          socket.userId === appointment.patient.userId;

        if (!isDoctorAuthorized && !isPatientAuthorized) {
          socket.emit("error", {
            code: "UNAUTHORIZED",
            message: "You are not authorized to join this session",
          });
          console.warn(`🚫 Unauthorized room access attempt:`, {
            socketId: socket.id,
            userId: socket.userId,
            roomId,
            appointmentId,
          });
          return;
        }

        // Check room capacity and handle duplicate connections
        const room = roomUsers.get(roomId) || new Set();

        // Check for duplicate user (same userId, different socket)
        for (const socketId of room) {
          const existingUser = activeUsers.get(socketId);
          if (existingUser && existingUser.userId === socket.userId) {
            // Same user reconnecting - replace old socket
            console.log(
              `🔄 User ${socket.userId} reconnecting, removing old socket ${socketId}`,
            );
            io.to(socketId).emit("session_replaced", {
              message: "You've connected from another tab or device",
            });

            // Disconnect old socket
            const oldSocket = io.sockets.sockets.get(socketId);
            if (oldSocket) {
              oldSocket.disconnect(true);
            }

            room.delete(socketId);
            activeUsers.delete(socketId);
          }
        }

        // Check if room is full (max 2 participants)
        if (room.size >= 2) {
          socket.emit("error", {
            code: "ROOM_FULL",
            message:
              "This session already has 2 participants (doctor and patient)",
          });
          console.warn(`⚠️ Room full: ${roomId}, rejected socket ${socket.id}`);
          return;
        }

        // Authorization passed - join room
        socket.join(roomId);

        const user = activeUsers.get(socket.id);
        if (user) {
          user.rooms.add(roomId);
        }

        // Track room membership
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId).add(socket.id);

        console.log(`📥 Socket ${socket.id} joined room: ${roomId}`);

        // Get other users in the room
        const otherUsers = Array.from(roomUsers.get(roomId) || [])
          .filter((id) => id !== socket.id)
          .map((id) => activeUsers.get(id))
          .filter(Boolean);

        // Notify the joiner about existing users
        if (otherUsers.length > 0) {
          socket.emit("room_users", {
            roomId,
            users: otherUsers.map((u) => ({ role: u.role, name: u.name })),
          });
        }

        // Notify others in room that a new user connected
        socket.to(roomId).emit("user_connected", {
          socketId: socket.id,
          user: user ? { role: user.role, name: user.name } : null,
        });
      } catch (error) {
        console.error(`❌ Error in join_room:`, error);
        socket.emit("error", {
          code: "SERVER_ERROR",
          message: "Failed to join room",
        });
      }
    });

    // Doctor starts session -> Notify patient in the room
    socket.on(
      "start_session",
      ({ roomId, doctorName, patientId, appointmentId }) => {
        console.log(`📢 Session started in room ${roomId} by ${doctorName}`);

        // Broadcast to room
        socket.to(roomId).emit("session_started", {
          doctorName,
          roomId,
          appointmentId,
          patientId,
        });

        // Also try to notify patient directly if they're online but not in room yet
        if (patientId) {
          for (const [socketId, user] of activeUsers.entries()) {
            if (user.userId === patientId && user.role === "PATIENT") {
              io.to(socketId).emit("session_started", {
                doctorName,
                roomId,
                appointmentId,
                patientId,
              });
              console.log(
                `🔔 Sent session notification directly to patient ${user.name}`,
              );
            }
          }
        }
      },
    );

    // WebRTC Signaling: Offer
    socket.on("offer", (data) => {
      // data: { offer, roomId }
      console.log(`🤝 Relaying WebRTC offer in room ${data.roomId}`);
      socket.to(data.roomId).emit("offer", data.offer);
    });

    // WebRTC Signaling: Answer
    socket.on("answer", (data) => {
      // data: { answer, roomId }
      console.log(`🤝 Relaying WebRTC answer in room ${data.roomId}`);
      socket.to(data.roomId).emit("answer", data.answer);
    });

    // WebRTC Signaling: ICE Candidate
    socket.on("ice_candidate", (data) => {
      // data: { candidate, roomId }
      console.log(`🧊 Relaying ICE candidate in room ${data.roomId}`);
      socket.to(data.roomId).emit("ice_candidate", data.candidate);
    });

    // Connection state updates
    socket.on("connection_state", (data) => {
      // data: { roomId, state: 'checking' | 'connected' | 'disconnected' | 'failed' }
      console.log(`📊 Connection state in ${data.roomId}: ${data.state}`);
      socket.to(data.roomId).emit("peer_connection_state", {
        state: data.state,
        socketId: socket.id,
      });
    });

    // User leaving a room
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);

      const user = activeUsers.get(socket.id);
      if (user) {
        user.rooms.delete(roomId);
      }

      // Remove from room tracking
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.id);
        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId);
        }
      }

      console.log(`📤 Socket ${socket.id} left room: ${roomId}`);

      // Notify others
      socket.to(roomId).emit("peer_left", {
        socketId: socket.id,
        user: user ? { role: user.role, name: user.name } : null,
      });
    });

    // Session end (clean termination)
    socket.on("end_session", ({ roomId }) => {
      console.log(`🛑 Session ended in room ${roomId}`);
      socket.to(roomId).emit("session_ended", { roomId });
    });

    // Handle Disconnect
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);

      if (user) {
        console.log(
          `❌ User disconnected: ${user.name} (${user.role}) - Socket: ${socket.id}`,
        );

        // Notify all rooms the user was in
        for (const roomId of user.rooms) {
          socket.to(roomId).emit("peer_left", {
            socketId: socket.id,
            user: { role: user.role, name: user.name },
          });

          // Clean up room tracking
          if (roomUsers.has(roomId)) {
            roomUsers.get(roomId).delete(socket.id);
            if (roomUsers.get(roomId).size === 0) {
              roomUsers.delete(roomId);
            }
          }
        }

        // Broadcast offline status
        socket.broadcast.emit("user_status", {
          userId: user.userId,
          role: user.role,
          name: user.name,
          status: "offline",
        });

        activeUsers.delete(socket.id);
      } else {
        console.log(`❌ Socket disconnected: ${socket.id}`);
      }
    });
  });
};
