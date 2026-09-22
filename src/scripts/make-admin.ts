import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { and, eq } from "drizzle-orm";
import { db } from "../lib/db";
import { accounts, users } from "../lib/db/schema";

const targetEmail =
  process.argv[2]?.trim().toLowerCase() || "mdrokonuzzaman45@gmail.com";
const rawPassword = process.argv[3]?.trim();

async function makeAdmin() {
  console.log(`\nPromoting user with email: ${targetEmail} to admin...`);

  try {
    let user = await db.query.users.findFirst({
      where: eq(users.email, targetEmail),
    });

    if (user) {
      const [updatedUser] = await db
        .update(users)
        .set({
          isAdmin: true,
          emailVerified: true,
          isBanned: false,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning();

      user = updatedUser;
      console.log("Successfully updated existing user to Admin:");
    } else {
      const [newUser] = await db
        .insert(users)
        .values({
          email: targetEmail,
          name: targetEmail.split("@")[0],
          isAdmin: true,
          emailVerified: true,
        })
        .returning();

      user = newUser;
      console.log("User did not exist. Created new Admin user:");
    }

    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified,
    });

    if (rawPassword) {
      const passwordHash = await hash(rawPassword, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      const existingAccount = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.userId, user.id),
          eq(accounts.provider, "email"),
        ),
      });

      if (existingAccount) {
        await db
          .update(accounts)
          .set({ passwordHash })
          .where(eq(accounts.id, existingAccount.id));
      } else {
        await db.insert(accounts).values({
          userId: user.id,
          provider: "email",
          providerUsername: targetEmail,
          passwordHash,
        });
      }

      console.log(`\nPassword successfully set for ${targetEmail}.`);
    }

    console.log("\nAdmin setup completed successfully.\n");
    process.exit(0);
  } catch (error) {
    console.error("Failed to make user admin:", error);
    process.exit(1);
  }
}

makeAdmin();
