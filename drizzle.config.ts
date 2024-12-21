import type { Config } from "drizzle-kit";

import { env } from "./env";

export default {
    out: "./lib/utils/db/migrations",
    schema: "./lib/utils/db/schema.ts",

    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL,
    },
    strict: true,
    verbose: true,
} satisfies Config;
