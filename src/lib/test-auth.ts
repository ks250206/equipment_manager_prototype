import "dotenv/config";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

async function main() {
  console.log("Testing authentication logic...");
  const email = "test@example.com";
  const password = "password123";

  console.log(`Fetching user: ${email}`);
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.error("User not found!");
    process.exit(1);
  }

  console.log("User found:", user.email);
  console.log("Stored hash:", user.password);

  console.log(`Comparing password '${password}' with hash...`);
  const match = await compare(password, user.password);
  console.log("Password match result:", match);

  if (match) {
    console.log("Authentication SUCCESS");
  } else {
    console.error("Authentication FAILED");
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
