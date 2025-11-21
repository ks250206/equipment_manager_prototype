import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtectedRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/calendar") ||
        nextUrl.pathname.startsWith("/buildings") ||
        nextUrl.pathname.startsWith("/equipment") ||
        nextUrl.pathname.startsWith("/profile");

      // Allow change-password page for logged-in users (now under /dashboard/change-password)
      if (isLoggedIn && nextUrl.pathname === "/dashboard/change-password") {
        return true;
      }

      // Note: Password change prompt is now shown in the dashboard information window
      // instead of redirecting, to avoid redirect loops

      // Protect authenticated routes
      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      // Redirect logged-in users from root or login to dashboard
      if (
        isLoggedIn &&
        (nextUrl.pathname === "/" || nextUrl.pathname === "/login")
      ) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "role" in user ? (user.role as string) : undefined;
        token.displayName =
          "displayName" in user ? (user.displayName as string | null) : null;
        token.avatarUrl =
          "avatarUrl" in user ? (user.avatarUrl as string | null) : null;
        token.phoneNumber =
          "phoneNumber" in user ? (user.phoneNumber as string | null) : null;
        token.department =
          "department" in user ? (user.department as string | null) : null;
        token.mustChangePassword =
          "mustChangePassword" in user
            ? (user.mustChangePassword as boolean)
            : false;
      }

      // Note: Database access is not available in Edge Runtime
      // Session will be refreshed by signing in again after password change

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.displayName = token.displayName as string | null;
        session.user.avatarUrl = token.avatarUrl as string | null;
        session.user.phoneNumber = token.phoneNumber as string | null;
        session.user.department = token.department as string | null;
        session.user.mustChangePassword = token.mustChangePassword as
          | boolean
          | undefined;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
