/**
 * Re-encrypts every stored environment-variable value under the current primary
 * encryption key (ENCRYPTION_PRIMARY_KEY_ID). Use this after adding a new key to
 * ENCRYPTION_KEYS and pointing the primary id at it.
 *
 *   pnpm rotate-keys           # dry run: reports what would change
 *   pnpm rotate-keys --apply   # writes changes (back up your database first)
 *
 * Values already encrypted under the primary key are skipped. Existing keys must
 * remain configured until rotation completes so older ciphertext can be read.
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { environmentVariables } from "../db/schema";
import { decrypt, encrypt, getPrimaryKeyId } from "../lib/crypto";

config({ path: ".env.local" });

async function main() {
  const apply = process.argv.includes("--apply");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const primaryKeyId = getPrimaryKeyId();
  const prefix = `${primaryKeyId}:`;

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  const rows = await db
    .select({
      id: environmentVariables.id,
      encryptedValue: environmentVariables.encryptedValue,
    })
    .from(environmentVariables);

  let reencrypted = 0;
  let alreadyPrimary = 0;
  const failures: string[] = [];

  for (const row of rows) {
    if (row.encryptedValue.startsWith(prefix)) {
      alreadyPrimary++;
      continue;
    }
    try {
      const next = encrypt(decrypt(row.encryptedValue));
      if (apply) {
        await db
          .update(environmentVariables)
          .set({ encryptedValue: next })
          .where(eq(environmentVariables.id, row.id));
      }
      reencrypted++;
    } catch {
      failures.push(row.id);
    }
  }

  console.log(
    `Key rotation ${apply ? "(APPLIED)" : "(dry run)"} -> primary key id "${primaryKeyId}"`
  );
  console.log(`  total variables:    ${rows.length}`);
  console.log(`  already on primary: ${alreadyPrimary}`);
  console.log(`  ${apply ? "re-encrypted" : "would re-encrypt"}:    ${reencrypted}`);
  console.log(`  failed to decrypt:  ${failures.length}`);
  if (failures.length) {
    console.log(`  failed ids: ${failures.join(", ")}`);
  }
  if (!apply && reencrypted > 0) {
    console.log("\nRun again with --apply to write changes. Back up your database first.");
  }
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
