import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.API_DATABASE_URL || "");
