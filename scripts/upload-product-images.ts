/**
 * upload-product-images.ts
 *
 * Downloads product images and uploads them to Supabase Storage (equipment-images bucket),
 * then updates each equipment row with thumbnail_url and images[0].
 *
 * Usage:
 *   VITE_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   npx tsx scripts/upload-product-images.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "equipment-images";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const IMAGE_MAP: Record<string, string> = {
  "Lightweight Folding Wheelchair":
    "https://assets.koinis.gr/5946-large_default/anapiriko-amaxidio-alouminiou-lion.jpg",
  "Heavy-Duty Wheelchair (150kg)":
    "https://assets.koinis.gr/4850-large_default/anapiriko-amaxidio-varews-tupou-mobiakcare-0808527.jpg",
  "Compact Power Wheelchair":
    "https://assets.koinis.gr/8823-large_default/odysseus-ilektrokinito-anapiriko-amaxidio-ptyssomeno-mobiakcare-0805700.jpg",
  "4-Wheel Mobility Scooter":
    "https://assets.koinis.gr/8328-large_default/-scooter-apollo.jpg",
  "Foldable Travel Scooter":
    "https://assets.koinis.gr/8329-large_default/-scooter-apollo.jpg",
  "Standard Rollator with Seat":
    "https://assets.koinis.gr/4112-large_default/peripaththras-rollator-mple-mobiakcare-0810616.jpg",
};

async function run() {
  // Fetch all equipment rows we need to update
  const { data: rows, error: fetchErr } = await supabase
    .from("equipment")
    .select("id, name_en, slug, images")
    .in("name_en", Object.keys(IMAGE_MAP));

  if (fetchErr || !rows) {
    console.error("Failed to fetch equipment:", fetchErr?.message);
    process.exit(1);
  }

  console.log(`Found ${rows.length} equipment rows to update.\n`);

  for (const row of rows) {
    const sourceUrl = IMAGE_MAP[row.name_en];
    if (!sourceUrl) {
      console.warn(`No image mapping for: ${row.name_en}`);
      continue;
    }

    const storagePath = `equipment/${row.slug}.jpg`;

    // Download image
    console.log(`Downloading: ${row.name_en}`);
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      console.error(`  ✗ Download failed (${res.status}): ${sourceUrl}`);
      continue;
    }
    const buffer = await res.arrayBuffer();

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadErr) {
      console.error(`  ✗ Upload failed: ${uploadErr.message}`);
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // Update equipment row
    const existingImages: string[] = Array.isArray(row.images) ? row.images : [];
    const updatedImages = [publicUrl, ...existingImages.slice(1)];

    const { error: updateErr } = await supabase
      .from("equipment")
      .update({ thumbnail_url: publicUrl, images: updatedImages })
      .eq("id", row.id);

    if (updateErr) {
      console.error(`  ✗ DB update failed: ${updateErr.message}`);
      continue;
    }

    console.log(`  ✓ ${row.slug} → ${publicUrl}`);
  }

  console.log("\nDone.");
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
