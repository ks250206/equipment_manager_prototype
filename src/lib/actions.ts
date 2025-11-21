"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

    // signIn with redirectTo will throw a NEXT_REDIRECT error, which is expected
    // This code won't execute if redirect works
    return undefined;
  } catch (error) {
    // Check if this is a redirect error (expected behavior)
    if (error && typeof error === "object" && "digest" in error) {
      const digest = (error as { digest?: string }).digest;
      if (digest?.startsWith("NEXT_REDIRECT")) {
        // This is the expected redirect, rethrow it so Next.js handles it
        throw error;
      }
    }

    // Handle actual authentication errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }

    // For other errors, rethrow
    throw error;
  }
}
