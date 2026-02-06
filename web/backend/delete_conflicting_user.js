const prisma = require('./prisma/prismaClient');

async function main() {
  console.log('Searching for User with email support@curevirtual.com...');
  const user = await prisma.user.findUnique({
    where: { email: 'support@curevirtual.com' },
  });

  if (user) {
    console.log(`Found conflicting User (id: ${user.id}, role: ${user.role}). Deleting...`);
    await prisma.user.delete({
      where: { email: 'support@curevirtual.com' },
    });
    console.log('Deleted successfully.');
  } else {
    console.log('No User found with this email.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
