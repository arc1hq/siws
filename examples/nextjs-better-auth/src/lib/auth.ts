import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { siws } from "@siws/better-auth"
import { db } from "./db"
import * as schema from "./auth-schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [
    siws({
      statement: "Sign in to the SIWS Demo App",
      cluster: "devnet",
    }),
    nextCookies(),
  ],
})
