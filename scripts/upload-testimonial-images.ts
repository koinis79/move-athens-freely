/**
 * upload-testimonial-images.ts
 *
 * Uploads customer testimonial photos to Supabase Storage
 * (equipment-images bucket, testimonials/ folder). The bucket is public,
 * so the resulting objects are served at:
 *   {SUPABASE_URL}/storage/v1/object/public/equipment-images/testimonials/<file>
 *
 * Photos are read from a local folder (default: ~/Desktop/eliana-testimonial-upload).
 * Uploaded with permission from the customer (Eliana F.).
 *
 * Usage:
 *   VITE_SUPABASE_URL=https://lmgpuqgwkiapgpdsxvmb.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   npx tsx scripts/upload-testimonial-images.ts
 *
 * Optional: pass a source folder as the first arg.
 *   npx tsx scripts/upload-testimonial-images.ts /path/to/folder
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "equipment-images";
const FOLDER = "testimonials";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sourceDir =
  process.argv[2] ?? join(homedir(), "Desktop", "eliana-testimonial-upload");

// Files to upload — filename in the source folder must match the storage name.
const FILES = ["eliana-hotel-room.jpg", "eliana-acropolis-lift.jpg"];

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  for (const file of FILES) {
    const localPath = join(sourceDir, file);
    const storagePath = `${FOLDER}/${file}`;

    let buffer: Buffer;
    try {
      buffer = await readFile(localPath);
    } catch {
      console.error(`  ✗ Cannot read ${localPath} — skipping`);
      continue;
    }

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadErr) {
      console.error(`  ✗ Upload failed for ${file}: ${uploadErr.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    console.log(`  ✓ ${file} → ${urlData.publicUrl}`);
  }

  console.log("\nDone.");
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
