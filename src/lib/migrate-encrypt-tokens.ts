/**
 * Migration utility to encrypt existing API tokens in database
 * Run this once to encrypt all plain-text tokens
 *
 * Usage:
 *   npx ts-node src/lib/migrate-encrypt-tokens.ts
 */

import { db } from "./db";
import { basecampSync, clientSites } from "@/db/schema";
import { encryptBasecampToken, encryptBricksApiKey } from "./secure-keys";
import { isEncrypted } from "./crypto";
import { eq } from "drizzle-orm";

/**
 * Encrypt all Basecamp tokens that are not yet encrypted
 */
export async function encryptBasecampTokens(): Promise<{
  total: number;
  encrypted: number;
  alreadyEncrypted: number;
  errors: number;
}> {
  const stats = {
    total: 0,
    encrypted: 0,
    alreadyEncrypted: 0,
    errors: 0,
  };

  try {
    // Get all basecamp sync records
    const records = await db.query.basecampSync.findMany();
    stats.total = records.length;

    for (const record of records) {
      if (!record.apiToken) {
        continue; // Skip if no token
      }

      // Check if already encrypted
      if (isEncrypted(record.apiToken)) {
        stats.alreadyEncrypted++;
        continue;
      }

      try {
        // Encrypt the token
        const encrypted = encryptBasecampToken(record.apiToken);
        if (!encrypted) {
          stats.errors++;
          continue;
        }

        // Update the record
        await db
          .update(basecampSync)
          .set({ apiToken: encrypted })
          .where(eq(basecampSync.id, record.id));

        stats.encrypted++;
        console.log(`✓ Encrypted Basecamp token for site ${record.siteId}`);
      } catch (error) {
        console.error(`✗ Failed to encrypt token for ${record.id}:`, error);
        stats.errors++;
      }
    }
  } catch (error) {
    console.error("Error encrypting Basecamp tokens:", error);
    throw error;
  }

  return stats;
}

/**
 * Encrypt all Bricks API keys that are not yet encrypted
 */
export async function encryptBricksApiKeys(): Promise<{
  total: number;
  encrypted: number;
  alreadyEncrypted: number;
  errors: number;
}> {
  const stats = {
    total: 0,
    encrypted: 0,
    alreadyEncrypted: 0,
    errors: 0,
  };

  try {
    // Get all client sites
    const sites = await db.query.clientSites.findMany();
    stats.total = sites.length;

    for (const site of sites) {
      if (!site.bricksApiKey) {
        continue; // Skip if no API key
      }

      // Check if already encrypted
      if (isEncrypted(site.bricksApiKey)) {
        stats.alreadyEncrypted++;
        continue;
      }

      try {
        // Encrypt the API key
        const encrypted = encryptBricksApiKey(site.bricksApiKey);
        if (!encrypted) {
          stats.errors++;
          continue;
        }

        // Update the record
        await db
          .update(clientSites)
          .set({ bricksApiKey: encrypted })
          .where(eq(clientSites.id, site.id));

        stats.encrypted++;
        console.log(`✓ Encrypted Bricks API key for site ${site.name}`);
      } catch (error) {
        console.error(`✗ Failed to encrypt API key for ${site.id}:`, error);
        stats.errors++;
      }
    }
  } catch (error) {
    console.error("Error encrypting Bricks API keys:", error);
    throw error;
  }

  return stats;
}

/**
 * Run all encryption migrations
 */
export async function migrateAllTokens() {
  console.log("🔐 Starting API token encryption migration...\n");

  console.log("Encrypting Basecamp tokens...");
  const basecampStats = await encryptBasecampTokens();
  console.log(`  Total: ${basecampStats.total}`);
  console.log(`  Encrypted: ${basecampStats.encrypted}`);
  console.log(`  Already encrypted: ${basecampStats.alreadyEncrypted}`);
  console.log(`  Errors: ${basecampStats.errors}\n`);

  console.log("Encrypting Bricks API keys...");
  const bricksStats = await encryptBricksApiKeys();
  console.log(`  Total: ${bricksStats.total}`);
  console.log(`  Encrypted: ${bricksStats.encrypted}`);
  console.log(`  Already encrypted: ${bricksStats.alreadyEncrypted}`);
  console.log(`  Errors: ${bricksStats.errors}\n`);

  const totalEncrypted =
    basecampStats.encrypted + bricksStats.encrypted;
  const totalErrors = basecampStats.errors + bricksStats.errors;

  console.log(`✅ Migration complete!`);
  console.log(`   ${totalEncrypted} tokens encrypted`);
  if (totalErrors > 0) {
    console.log(`   ⚠️  ${totalErrors} errors occurred`);
  }
}

// Run if executed directly
if (require.main === module) {
  migrateAllTokens()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
