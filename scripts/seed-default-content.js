#!/usr/bin/env node
/**
 * Seed default content into Supabase educational_contents table.
 * This ensures the default Video MP-ASI and PDF Buku Foto Makanan
 * are always available in the database (not just in localStorage).
 *
 * Run this once after the RLS policies are set up.
 */

const SUPA_URL = "https://jyumdeahkufhhrnhkdql.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dW1kZWFoa3VmaGhybmhrZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTY5MjksImV4cCI6MjEwMzI5MjkyOX0.lx2Cv9Wi4yhvQLTgeXiVwylw-HSzDxMj2lHEf05ZUms";

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const TABLE = "educational_contents";

const DEFAULT_CONTENT = [
  {
    title: "Video Edukasi MP-ASI dan Resep MP-ASI",
    description:
      "Video edukasi resmi dari UPTD Puskesmas Neglasari Kota Bandung. Pelajari cara memberikan MP-ASI yang tepat sesuai usia anak beserta contoh resep MP-ASI bergizi yang mudah dibuat di rumah.",
    content_type: "video",
    category: "MP-ASI",
    video_source: "upload",
    media_url: "/videos/video-mp-asi-resep.mp4",
    duration: "Lokal",
    is_active: true,
    display_order: 1,
    created_by: "admin@gemas.id",
  },
  {
    title: "Buku Foto Makanan GEMAS (Indeks Search)",
    description:
      "Buku foto makanan digital berisi daftar bahan makanan beserta ukuran rumah tangga (URT), berat, dan kandungan gizi. Cocok untuk panduan praktis dalam menyusun menu makan anak sehari-hari.",
    content_type: "pdf",
    category: "Gizi Seimbang",
    media_url: "/pdfs/buku-foto-makanan.pdf",
    file_size: "44 MB",
    is_active: true,
    display_order: 2,
    created_by: "admin@gemas.id",
  },
];

async function main() {
  console.log("=== Seeding default content to Supabase ===\n");

  // First check if default content already exists (by title)
  for (const content of DEFAULT_CONTENT) {
    const checkUrl = `${SUPA_URL}/rest/v1/${TABLE}?title=eq.${encodeURIComponent(content.title)}&select=id`;
    const checkRes = await fetch(checkUrl, { headers });
    const existing = await checkRes.json();

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`[SKIP] Already exists: ${content.title}`);
      continue;
    }

    // Insert
    const insertRes = await fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers,
      body: JSON.stringify(content),
    });

    if (insertRes.ok) {
      const inserted = await insertRes.json();
      console.log(`[OK] Inserted: ${content.title} (id: ${inserted[0]?.id})`);
    } else {
      const err = await insertRes.json();
      console.log(`[FAIL] ${content.title}: ${JSON.stringify(err)}`);
    }
  }

  console.log("\n=== Verify all content ===");
  const allRes = await fetch(
    `${SUPA_URL}/rest/v1/${TABLE}?select=id,title,content_type,is_active&order=display_order.asc`,
    { headers }
  );
  const all = await allRes.json();
  console.log(`Total content: ${all.length}`);
  for (const c of all) {
    console.log(`  - [${c.content_type}] ${c.is_active ? "✅" : "📝"} ${c.title}`);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
