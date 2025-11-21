import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

export const { auth, signIn, signOut } = NextAuth({
  debug: true,
  secret: process.env.AUTH_SECRET,
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (!user) {
            return null;
          }

          const passwordsMatch = await compare(password, user.password);

          if (passwordsMatch) {
            return {
              ...user,
              mustChangePassword: user.mustChangePassword === "true",
            };
          }
        }

        return null;
      },
    }),
  ],
});
