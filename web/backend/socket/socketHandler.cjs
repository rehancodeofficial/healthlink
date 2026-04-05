// FILE: backend/socket/socketHandler.js
const prisma = require("../prisma/prismaClient");

// Store active users and their rooms
const activeUsers = new Map(); // socketId -> { userId, role, name, rooms: Set }
const roomUsers = new Map(); // roomId -> Set of socketIds
const callTimeouts = new Map(); // appointmentId -> setTimeout ID

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
          console.warn(`⚠️ Appointment not found: ${appointmentId} by socket ${socket.id}`);
          return;
        }

        // Verify user is authorized (either doctor or patient)
        const isDoctorAuthorized = socket.userId === appointment.doctor.userId;
        const isPatientAuthorized = socket.userId === appointment.patient.userId;

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
            console.log(`🔄 User ${socket.userId} reconnecting, removing old socket ${socketId}`);
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
            message: "This session already has 2 participants (doctor and patient)",
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

    /* ==========================================================
       VIDEO CALL SIGNALING (Doctor Initiated with 60s Timeout)
       ========================================================== */

    socket.on(
      "initiate-video-call",
      async ({ consultationId, patientId, doctorName, roomName }) => {
        console.log(`🔔 Call initiated for consultation ${consultationId} by ${doctorName}`);

        try {
          // 1. Update DB Status to RINGING
          await prisma.videoConsultation.update({
            where: { id: consultationId },
            data: { status: "RINGING" },
          });

          // 2. Notify Patient
          let patientNotified = false;
          for (const [socketId, user] of activeUsers.entries()) {
            if (user.userId === patientId && user.role === "PATIENT") {
              io.to(socketId).emit("incoming-call", {
                consultationId,
                doctorName,
                doctorUserId: socket.userId, // Send doctor's ID to patient
                roomName,
              });
              patientNotified = true;
            }
          }

          if (!patientNotified) {
            console.warn(`⚠️ Patient ${patientId} is not online for call ${consultationId}`);
            socket.emit("call-failed", {
              consultationId,
              reason: "Patient is currently offline.",
            });
          }

          // 3. Set 60s Timeout for MISSED status
          if (callTimeouts.has(consultationId)) {
            clearTimeout(callTimeouts.get(consultationId));
          }

          const timeoutId = setTimeout(async () => {
            try {
              const current = await prisma.videoConsultation.findUnique({
                where: { id: consultationId },
              });

              if (current && current.status === "RINGING") {
                await prisma.videoConsultation.update({
                  where: { id: consultationId },
                  data: { status: "MISSED" },
                });

                // Notify both sides of timeout
                io.to(socket.id).emit("call-missed", { consultationId });

                // Notify patient if online
                for (const [sId, u] of activeUsers.entries()) {
                  if (u.userId === patientId) {
                    io.to(sId).emit("call-missed", { consultationId });
                  }
                }

                console.log(`⏰ Call ${consultationId} timed out after 60s`);
              }
            } catch (err) {
              console.error("Error handling call timeout:", err);
            } finally {
              callTimeouts.delete(consultationId);
            }
          }, 60000);

          callTimeouts.set(consultationId, timeoutId);
        } catch (err) {
          console.error("❌ Error initiating call:", err);
          socket.emit("error", { message: "Failed to initiate call" });
        }
      }
    );

    socket.on("accept-video-call", async ({ consultationId, doctorUserId }) => {
      console.log(`✅ Call ${consultationId} accepted by patient`);

      try {
        // 1. Clear Timeout
        if (callTimeouts.has(consultationId)) {
          clearTimeout(callTimeouts.get(consultationId));
          callTimeouts.delete(consultationId);
        }

        // 2. Update DB to ACCEPTED
        await prisma.videoConsultation.update({
          where: { id: consultationId },
          data: { status: "ACCEPTED" },
        });

        // 3. Notify Doctor
        for (const [socketId, user] of activeUsers.entries()) {
          if (user.userId === doctorUserId && user.role === "DOCTOR") {
            io.to(socketId).emit("call-accepted", { consultationId });
          }
        }
      } catch (err) {
        console.error("❌ Error accepting call:", err);
      }
    });

    socket.on("reject-video-call", async ({ consultationId, doctorUserId }) => {
      console.log(`❌ Call ${consultationId} rejected by patient`);

      try {
        // 1. Clear Timeout
        if (callTimeouts.has(consultationId)) {
          clearTimeout(callTimeouts.get(consultationId));
          callTimeouts.delete(consultationId);
        }

        // 2. Update DB to REJECTED
        await prisma.videoConsultation.update({
          where: { id: consultationId },
          data: { status: "REJECTED" },
        });

        // 3. Notify Doctor
        if (doctorUserId) {
          for (const [socketId, user] of activeUsers.entries()) {
            if (user.userId === doctorUserId && user.role === "DOCTOR") {
              io.to(socketId).emit("call-rejected", { consultationId });
            }
          }
        } else {
          // Fallback: Notify everyone in the "room" (if any) or find by consultation metadata
          console.warn(`⚠️ No doctorUserId provided for reject-video-call ${consultationId}`);
        }
      } catch (err) {
        console.error("❌ Error rejecting call:", err);
      }
    });

    // Doctor starts session (legacy / generic)
    socket.on("start_session", ({ roomId, doctorName, patientId, appointmentId }) => {
      console.log(`📢 Session started in room ${roomId} by ${doctorName}`);
      socket.to(roomId).emit("session_started", { doctorName, roomId, appointmentId, patientId });
      if (patientId) {
        for (const [socketId, user] of activeUsers.entries()) {
          if (user.userId === patientId && user.role === "PATIENT") {
            io.to(socketId).emit("session_started", {
              doctorName,
              roomId,
              appointmentId,
              patientId,
            });
          }
        }
      }
    });

    // User leaving a room
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      const user = activeUsers.get(socket.id);
      if (user) user.rooms.delete(roomId);
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(socket.id);
        if (roomUsers.get(roomId).size === 0) roomUsers.delete(roomId);
      }
      socket.to(roomId).emit("user_left", {
        socketId: socket.id,
        user: user ? { role: user.role, name: user.name } : null,
      });
    });

    // Session end (clean termination)
    socket.on("end_session", ({ roomId }) => {
      console.log(`🛑 Session ended in room ${roomId}`);
      io.to(roomId).emit("session_ended", { roomId });
      io.in(roomId).socketsLeave(roomId);
    });

    // Handle Disconnect
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);
      if (user) {
        console.log(`❌ User disconnected: ${user.name} (${user.role})`);
        for (const roomId of user.rooms) {
          socket
            .to(roomId)
            .emit("user_left", { socketId: socket.id, user: { role: user.role, name: user.name } });
          if (roomUsers.has(roomId)) {
            roomUsers.get(roomId).delete(socket.id);
            if (roomUsers.get(roomId).size === 0) roomUsers.delete(roomId);
          }
        }
        socket.broadcast.emit("user_status", {
          userId: user.userId,
          role: user.role,
          name: user.name,
          status: "offline",
        });
        activeUsers.delete(socket.id);
      }
    });
  });
};
