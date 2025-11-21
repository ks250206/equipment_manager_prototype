import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      displayName?: string | null;
      avatarUrl?: string | null;
      phoneNumber?: string | null;
      department?: string | null;
      mustChangePassword?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    phoneNumber?: string | null;
    department?: string | null;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    phoneNumber?: string | null;
    department?: string | null;
    mustChangePassword?: boolean;
  }
}
