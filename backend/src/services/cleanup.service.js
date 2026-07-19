// FILE: backend/services/cleanup.service.js
const cron = require("node-cron");
const prisma = require("../prisma/prismaClient");

/**
 * Cleanup Service: Deletes VideoConsultation records older than 30 days.
 * Runs every day at midnight.
 */
function initCleanupJob() {
  console.log(" Initializing VideoConsultation Cleanup Job...");

  // '0 0 * * *' = Every day at 00:00
  cron.schedule("0 0 * * *", async () => {
    console.log(" Running VideoConsultation Cleanup...");
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await prisma.videoConsultation.deleteMany({
        where: {
          scheduledAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      console.log(
        ` Cleanup completed. Deleted ${deleted.count} old records.`,
      );
    } catch (err) {
      console.error(" Error during VideoConsultation cleanup:", err);
    }
  });

  console.log(" Cleanup Job scheduled: Daily at midnight.");
}

module.exports = { initCleanupJob };
