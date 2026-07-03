require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const prisma = require("./prisma/prismaClient");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  {
    email: "superadmin@curevirtual.com",
    password: "Curevirtual@123",
    role: "SUPERADMIN",
    firstName: "Super",
    lastName: "Admin",
  },
  {
    email: "admin@curevirtual.com",
    password: "123456",
    role: "ADMIN",
    firstName: "Admin",
    lastName: "User",
  },
  {
    email: "support@curevirtual.com",
    password: "123456",
    role: "SUPPORT",
    firstName: "Support",
    lastName: "Agent",
  },
];

async function main() {
  for (const account of accounts) {
    console.log(`\n--- Processing ${account.email} (${account.role}) ---`);

    // Step 1: Check if user already exists in Supabase Auth
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw new Error("Failed to list users: " + listError.message);

    console.log(`  [Auth] Total users in Auth: ${listData.users.length}`);
    console.log(`  [Auth] Existing emails: ${listData.users.map((u) => u.email).join(", ")}`);

    let authUser = listData.users.find((u) => u.email === account.email);

    if (!authUser) {
      // Check if Prisma user exists and try to find in Auth by that ID
      const existingPrismaUser = await prisma.user.findUnique({ where: { email: account.email } });
      if (existingPrismaUser) {
        console.log(
          `  [DB] Found existing user in DB with ID: ${existingPrismaUser.id}. Checking Auth for this ID...`
        );
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          existingPrismaUser.id
        );
        if (userData && userData.user) {
          console.log(`  [Auth] Found user by ID in Auth!`);
          authUser = userData.user;
        } else {
          console.log(
            `  [Auth] User not found in Auth by ID ${existingPrismaUser.id}. Error: ${userError?.message}`
          );
        }
      }
    }

    if (authUser) {
      console.log(`  [Auth] User already exists, updating password + Confirm...`);
      const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(
        authUser.id,
        {
          password: account.password,
          email_confirm: true,
        }
      );
      if (updateErr) throw new Error("Failed to update auth user: " + updateErr.message);
      authUser = updated.user;
    } else {
      console.log(`  [Auth] Creating new Supabase auth user...`);
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
      });
      if (createErr) {
        console.error(`  [Auth] Create user error details:`, JSON.stringify(createErr, null, 2));
        throw new Error("Failed to create auth user: " + createErr.message);
      }
      authUser = created.user;
    }

    console.log(`  [Auth] Auth user ID: ${authUser.id}`);

    // Step 2: Upsert in Prisma User table using the Supabase auth UUID as the ID
    const dbUser = await prisma.user.upsert({
      where: { email: account.email },
      update: {
        role: account.role,
        firstName: account.firstName,
        lastName: account.lastName,
      },
      create: {
        id: authUser.id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        role: account.role,
        gender: "PREFER_NOT_TO_SAY",
        dateOfBirth: new Date("1990-01-01"),
      },
    });

    console.log(`  [DB] User upserted: id=${dbUser.id}, role=${dbUser.role}`);

    // Step 3: If role is SUPPORT, ensure they are in SupportAgent table
    if (account.role === "SUPPORT") {
      await prisma.supportAgent.upsert({
        where: { userId: dbUser.id },
        update: { isActive: true },
        create: {
          userId: dbUser.id,
          isActive: true,
        },
      });
      console.log(`  [DB] SupportAgent record ensured for ${account.email}`);
    }

    console.log(`  ✅ Done: ${account.email} → ${account.role}`);
  }

  console.log("\n🎉 All accounts seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
