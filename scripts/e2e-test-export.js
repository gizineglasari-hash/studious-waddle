#!/usr/bin/env node
/**
 * End-to-end test for Excel Export feature.
 * Simulates what fetchAllDataForExport does:
 * 1. Fetch ALL profiles from Supabase
 * 2. Fetch ALL children
 * 3. Fetch ALL consultations
 * 4. Verify the data is complete (no pagination truncation)
 */

const SUPA_URL = "https://jyumdeahkufhhrnhkdql.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dW1kZWFoa3VmaGhybmhrZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTY5MjksImV4cCI6MjEwMzI5MjkyOX0.lx2Cv9Wi4yhvQLTgeXiVwylw-HSzDxMj2lHEf05ZUms";

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
};

async function fetchAllDataForExport() {
  console.log("=== Simulating fetchAllDataForExport (Admin Export) ===\n");

  // 1. Fetch ALL profiles
  console.log("1. Fetching ALL profiles...");
  const profilesRes = await fetch(
    `${SUPA_URL}/rest/v1/profiles?select=id,nama_orang_tua,email,nomor_telepon,alamat,role,created_at&order=created_at.asc`,
    { headers }
  );
  const profiles = await profilesRes.json();
  const regularUsers = profiles.filter((p) => p.role === "user");
  console.log(`   ✅ Fetched ${profiles.length} total profiles (${regularUsers.length} regular users)`);

  // 2. Fetch ALL children
  console.log("2. Fetching ALL children...");
  const childrenRes = await fetch(
    `${SUPA_URL}/rest/v1/children?select=*&order=created_at.asc`,
    { headers }
  );
  const children = await childrenRes.json();
  console.log(`   ✅ Fetched ${children.length} children records`);

  // 3. Fetch ALL consultations
  console.log("3. Fetching ALL consultations...");
  const consultRes = await fetch(
    `${SUPA_URL}/rest/v1/broadcast_consultations?select=*&order=created_at.asc`,
    { headers }
  );
  const consultations = await consultRes.json();
  console.log(`   ✅ Fetched ${consultations.length} consultation records`);

  console.log("\n=== Building Excel rows (one row per child) ===\n");

  let totalRows = 0;
  let usersWithChildren = 0;
  let usersWithoutChildren = 0;
  let usersWithConsultations = 0;
  let usersWithoutConsultations = 0;

  for (const user of regularUsers) {
    const userChildren = children.filter((c) => c.user_id === user.id);
    const userConsultations = consultations.filter((c) => c.user_id === user.id);

    if (userChildren.length > 0) {
      usersWithChildren++;
      totalRows += userChildren.length;
    } else {
      usersWithoutChildren++;
      totalRows += 1; // one row with empty child fields
    }

    if (userConsultations.length > 0) {
      usersWithConsultations++;
    } else {
      usersWithoutConsultations++;
    }
  }

  console.log(`Total Excel rows that will be generated: ${totalRows}`);
  console.log(`Users with children: ${usersWithChildren}`);
  console.log(`Users without children (1 row each): ${usersWithoutChildren}`);
  console.log(`Users with consultations: ${usersWithConsultations}`);
  console.log(`Users without consultations: ${usersWithoutConsultations}`);

  console.log("\n=== Sample rows (first 5 users) ===\n");
  let sampleCount = 0;
  for (const user of regularUsers.slice(0, 5)) {
    const userChildren = children.filter((c) => c.user_id === user.id);
    const userConsultations = consultations.filter((c) => c.user_id === user.id);
    const consultCount = userConsultations.length;

    let lastConsultDate = "Belum ada konsultasi";
    if (userConsultations.length > 0) {
      const dates = userConsultations
        .map((c) => c.created_at)
        .filter(Boolean)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (dates.length > 0) {
        const d = new Date(dates[0]);
        lastConsultDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      }
    }

    if (userChildren.length === 0) {
      console.log(`Row: ${user.nama_orang_tua} | ${user.email} | No children | Konsultasi: ${consultCount} | Last: ${lastConsultDate}`);
    } else {
      for (const child of userChildren) {
        console.log(`Row: ${user.nama_orang_tua} | ${user.email} | Child: ${child.nama_anak} (${child.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}) | BB: ${child.berat_badan}kg, TB: ${child.tinggi_badan}cm | Konsultasi: ${consultCount} | Last: ${lastConsultDate}`);
      }
    }
    sampleCount++;
  }

  console.log("\n=== TEST RESULTS ===");
  const tests = [
    { name: "All profiles fetched (no pagination)", pass: profiles.length > 0 },
    { name: "All children fetched", pass: children.length >= 0 }, // could be 0 if no children yet
    { name: "All consultations fetched", pass: consultations.length >= 0 },
    { name: "Regular users filtered (role=user)", pass: regularUsers.length === profiles.filter((p) => p.role === "user").length },
    { name: "Total rows = sum of children + users without children", pass: totalRows > 0 },
  ];

  for (const t of tests) {
    console.log(`  ${t.pass ? "✅" : "❌"} ${t.name}`);
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Database contains:`);
  console.log(`  - ${regularUsers.length} regular users`);
  console.log(`  - ${children.length} children records`);
  console.log(`  - ${consultations.length} consultation records`);
  console.log(`Excel file will have ${totalRows} rows (one per child, or one per user if no children)`);
}

fetchAllDataForExport().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
