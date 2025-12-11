import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function checkUserRole() {
  try {
    const email = "mdshishirahmed811+1@gmail.com";
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log("User Details:");
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name || "N/A"}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Email Verified: ${user.emailVerified}`);
    
    if (user.role !== "admin") {
      console.log(`\n⚠️  User is not an admin. Current role: ${user.role}`);
      console.log("Setting user as admin...");
      
      await prisma.user.update({
        where: { email },
        data: { role: "admin" },
      });
      
      console.log(`✅ Successfully set ${email} as admin`);
    } else {
      console.log(`\n✅ User is already an admin`);
    }
  } catch (error) {
    console.error("Error checking user role:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();

