import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      systemRole: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    systemRole?: "USER" | "ADMIN";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    systemRole: "USER" | "ADMIN";
  }
}
