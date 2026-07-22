const { PrismaClient } = require("@prisma/client");

let databaseUrl = process.env.DATABASE_URL;

// Detect if running inside Docker container
const isDocker = require("fs").existsSync("/.dockerenv");
if (isDocker && databaseUrl && databaseUrl.includes("localhost")) {
  databaseUrl = databaseUrl.replace("localhost", "host.docker.internal");
  console.log("[Prisma] Detected Docker environment. Rewrote database URL host to host.docker.internal");
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

module.exports = prisma;
