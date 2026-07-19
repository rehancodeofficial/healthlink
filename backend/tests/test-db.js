const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing connection...");
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log("✅ Successfully connected to Supabase Database via Pooler! User count: " + count);
  } catch (error) {
    console.error("❌ Failed to connect:", error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
