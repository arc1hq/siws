import type { BetterAuthPluginDBSchema } from "better-auth/db"

/**
 * Database schema for the SIWS plugin.
 *
 * Defines the `solanaAddress` table which stores Solana wallet addresses
 * linked to user accounts. Each (address, cluster) pair is unique, so
 * concurrent first sign-ins for the same wallet cannot create two links.
 */
export const schema = {
  solanaAddress: {
    fields: {
      userId: {
        type: "string",
        references: { model: "user", field: "id", onDelete: "cascade" },
        required: true,
        index: true,
      },
      address: {
        type: "string",
        required: true,
        index: true,
      },
      cluster: {
        type: "string",
        required: true,
      },
      isPrimary: {
        type: "boolean",
        defaultValue: false,
      },
      createdAt: {
        type: "date",
        required: true,
      },
    },
    indexes: [{ fields: ["address", "cluster"], unique: true }],
  },
} satisfies BetterAuthPluginDBSchema
