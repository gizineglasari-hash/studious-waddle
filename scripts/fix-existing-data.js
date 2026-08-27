#!/usr/bin/env node
/**
 * Fix existing user_id mismatch in broadcast_consultations table.
 * Matches by nama_orang_tua and updates user_id to match profiles.id.
 */

const SUPA_URL = "https://jyumdeahkufhhrnhkdql.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dW1kZWFoa3VmaGhybmhrZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTY5MjksImV4cCI6MjEwMzI5MjkyOX0.lx2Cv9Wi4yhvQLTgeXiVwylw-HSzDxMj2lHEf05ZUms";

async function main() {
  console.log("=== Fetching all profiles ===");
  const profilesRes = await fetch(
    `${SUPA_URL}/rest/v1/profiles?select=id,email,nama_orang_tua`,
    {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    }
  );
  const profiles = await profilesRes.json();
  console.log(`Found ${profiles.length} profiles:`);
  for (const p of profiles) {
    console.log(`  ${p.id} | ${p.email} | ${p.nama_orang_tua}`);
  }

  console.log("\n=== Fetching all broadcast_consultations ===");
  const bcRes = await fetch(
    `${SUPA_URL}/rest/v1/broadcast_consultations?select=id,user_id,nama_orang_tua`,
    {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    }
  );
  const consultations = await bcRes.json();
  console.log(`Found ${consultations.length} consultations:`);
  for (const c of consultations) {
    console.log(`  ${c.id} | user_id: ${c.user_id} | ${c.nama_orang_tua}`);
  }

  console.log("\n=== Matching and updating ===");
  let updated = 0;
  let skipped = 0;

  for (const c of consultations) {
    // Find matching profile by nama_orang_tua (case-insensitive)
    const match = profiles.find(
      (p) => p.nama_orang_tua && c.nama_orang_tua &&
             p.nama_orang_tua.toLowerCase() === c.nama_orang_tua.toLowerCase()
    );

    if (!match) {
      console.log(`  [SKIP] No profile match for: ${c.nama_orang_tua}`);
      skipped++;
      continue;
    }

    if (match.id === c.user_id) {
      console.log(`  [OK] Already matched: ${c.nama_orang_tua} → ${match.id}`);
      skipped++;
      continue;
    }

    // Update the user_id
    console.log(`  [UPDATE] ${c.nama_orang_tua}: ${c.user_id} → ${match.id}`);

    const updateRes = await fetch(
      `${SUPA_URL}/rest/v1/broadcast_consultations?id=eq.${c.id}`,
      {
        method: "PATCH",
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ user_id: match.id }),
      }
    );

    const updateData = await updateRes.json();
    if (updateRes.ok) {
      console.log(`    ✅ Updated successfully`);
      updated++;
    } else {
      console.log(`    ❌ Update failed:`, JSON.stringify(updateData));
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${consultations.length}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
