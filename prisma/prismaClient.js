// Centralized Prisma client (singleton), CommonJS
const { PrismaClient } = require("@prisma/client");

// Reuse the client in dev to avoid exhausting connections on hot reloads
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: ["error", "warn"], // add "query" if you need to debug
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;
