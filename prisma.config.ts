import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection on hosts like Neon;
    // fall back to DATABASE_URL locally where there is no pooler.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
