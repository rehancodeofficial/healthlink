// Polyfill for Headers, Fetch, and Request
if (typeof global.Headers === "undefined") {
  const { Headers, Request, Response, fetch } = require("node-fetch-native");
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
  global.fetch = fetch;
}

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const env = require("./config/env");

const allowedOrigins = [
  "https://HealthBridge-2.vercel.app",
  env.FRONTEND_URL,
  env.APP_BASE_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket Authentication Middleware & Handler
const socketAuth = require("./middlewares/socketAuth");
io.use(socketAuth);
require("./socket/socketHandler.cjs")(io);

const PORT = env.PORT || 5001;
server.listen(PORT, "0.0.0.0", () => {
  console.log("-------------------------------------------");
  console.log(` Server running on: http://0.0.0.0:${PORT}`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(`  Started at: ${new Date().toISOString()}`);
  console.log("-------------------------------------------");
});
