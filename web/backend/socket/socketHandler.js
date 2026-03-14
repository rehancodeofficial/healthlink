// FILE: backend/socket/socketHandler.js

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join a specific room (consultation ID)
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);

      // Notify others in room that a user connected
      socket.to(roomId).emit("user_connected", socket.id);
    });

    // Doctor starts session -> Notify patient
    socket.on("start_session", ({ roomId, doctorName }) => {
      console.log(`📢 Session started in ${roomId} by ${doctorName}`);
      socket.to(roomId).emit("session_started", { doctorName, roomId });
    });

    // WebRTC Signaling: Offer
    socket.on("offer", (data) => {
      // data: { offer, roomId }
      console.log(`Relaying offer in ${data.roomId}`);
      socket.to(data.roomId).emit("offer", data.offer);
    });

    // WebRTC Signaling: Answer
    socket.on("answer", (data) => {
      // data: { answer, roomId }
      console.log(`Relaying answer in ${data.roomId}`);
      socket.to(data.roomId).emit("answer", data.answer);
    });

    // WebRTC Signaling: ICE Candidate
    socket.on("ice_candidate", (data) => {
      // data: { candidate, roomId }
      console.log(`Relaying ICE candidate in ${data.roomId}`);
      socket.to(data.roomId).emit("ice_candidate", data.candidate);
    });

    // Handle Disconnect
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};
