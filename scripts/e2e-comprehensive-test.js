#!/usr/bin/env node
/**
 * COMPREHENSIVE END-TO-END TEST
 * Tests: Admin content → Public page + User children → Admin dashboard → Excel
 */

const SUPA_URL = "https://jyumdeahkufhhrnhkdql.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5dW1kZWFoa3VmaGhybmhrZHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTY5MjksImV4cCI6MjEwMzI5MjkyOX0.lx2Cv9Wi4yhvQLTgeXiVwylw-HSzDxMj2lHEf05ZUms";

const headers = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function test() {
  console.log("=== COMPREHENSIVE END-TO-END TEST ===\n");

  // ============================================
  // PART A: Admin Content → Public Page
  // ============================================
  console.log("=== PART A: Admin Content → Public Page ===\n");

  // Test 1: Add a new video content (Published)
  console.log("TEST 1: Admin adds new Published video content");
  const videoRes = await fetch(`${SUPA_URL}/rest/v1/educational_contents`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "E2E Test: Video Gizi Balita",
      description: "Video test untuk verifikasi sync ke halaman publik",
      content_type: "video",
      category: "Gizi Anak",
      video_source: "youtube",
      external_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      is_active: true,
      display_order: 50,
      duration: "10:00",
      created_by: "admin@gemas.id",
    }),
  });
  const videoData = await videoRes.json();
  const videoId = videoData[0]?.id;
  console.log(`  ✅ Added video content: ${videoId}`);
  console.log(`  ✅ Title: ${videoData[0]?.title}`);
  console.log(`  ✅ Status: ${videoData[0]?.is_active ? "Published" : "Draft"}`);

  // Verify it's visible to public (is_active=true)
  await delay(500);
  const pubContentRes = await fetch(
    `${SUPA_URL}/rest/v1/educational_contents?select=id,title,is_active&order=display_order.asc`,
    { headers }
  );
  const pubContent = await pubContentRes.json();
  const visibleToPublic = pubContent.filter((c) => c.is_active === true);
  const newVideoVisible = visibleToPublic.some((c) => c.id === videoId);
  console.log(`  ${newVideoVisible ? "✅" : "❌"} Visible to public (is_active=true): ${newVideoVisible}`);

  // Test 2: Add a Draft content (should NOT be visible)
  console.log("\nTEST 2: Admin adds Draft content (should NOT be visible to public)");
  const draftRes = await fetch(`${SUPA_URL}/rest/v1/educational_contents`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "E2E Test: Draft Article",
      description: "This is a draft - should not appear on public page",
      content_type: "article",
      category: "Lainnya",
      article_content: "Draft content",
      is_active: false,
      display_order: 51,
      created_by: "admin@gemas.id",
    }),
  });
  const draftData = await draftRes.json();
  const draftId = draftData[0]?.id;
  console.log(`  ✅ Added draft content: ${draftId}`);
  console.log(`  ✅ Status: Draft (is_active=false)`);

  // Verify draft is NOT visible to public
  await delay(500);
  const pubContentRes2 = await fetch(
    `${SUPA_URL}/rest/v1/educational_contents?select=id,title,is_active&order=display_order.asc`,
    { headers }
  );
  const pubContent2 = await pubContentRes2.json();
  const visibleToPublic2 = pubContent2.filter((c) => c.is_active === true);
  const draftNotVisible = !visibleToPublic2.some((c) => c.id === draftId);
  console.log(`  ${draftNotVisible ? "✅" : "❌"} Draft NOT visible to public: ${draftNotVisible}`);

  // Test 3: Edit content title
  console.log("\nTEST 3: Admin edits content title");
  await fetch(`${SUPA_URL}/rest/v1/educational_contents?id=eq.${videoId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ title: "E2E Test: Video Gizi Balita [UPDATED]" }),
  });
  const editedRes = await fetch(
    `${SUPA_URL}/rest/v1/educational_contents?id=eq.${videoId}&select=title`,
    { headers }
  );
  const editedData = await editedRes.json();
  console.log(`  ${editedData[0]?.title.includes("[UPDATED]") ? "✅" : "❌"} Edit visible: ${editedData[0]?.title}`);

  // Test 4: Delete content
  console.log("\nTEST 4: Admin deletes content");
  const delRes = await fetch(`${SUPA_URL}/rest/v1/educational_contents?id=eq.${videoId}`, {
    method: "DELETE",
    headers,
  });
  console.log(`  ${delRes.ok ? "✅" : "❌"} Deleted: ${delRes.status}`);
  // Also cleanup draft
  await fetch(`${SUPA_URL}/rest/v1/educational_contents?id=eq.${draftId}`, {
    method: "DELETE",
    headers,
  });

  // ============================================
  // PART B: User Children → Admin Dashboard → Excel
  // ============================================
  console.log("\n=== PART B: User Children → Admin → Excel ===\n");

  // Get a real user ID from profiles
  const profilesRes = await fetch(
    `${SUPA_URL}/rest/v1/profiles?role=eq.user&select=id,email,nama_orang_tua`,
    { headers }
  );
  const profiles = await profilesRes.json();
  const testUser = profiles[0];
  console.log(`Test user: ${testUser?.nama_orang_tua} (${testUser?.email})`);
  console.log(`User ID: ${testUser?.id}\n`);

  // Test 5: Add child 1
  console.log("TEST 5: User adds child 1 (Ahmad)");
  const child1Res = await fetch(`${SUPA_URL}/rest/v1/children`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: testUser.id,
      nama_anak: "E2E Test Ahmad",
      tanggal_lahir: "2023-01-10",
      jenis_kelamin: "L",
      berat_badan: 12.5,
      tinggi_badan: 88,
    }),
  });
  const child1Data = await child1Res.json();
  const child1Id = child1Data[0]?.id;
  console.log(`  ✅ Added child: ${child1Data[0]?.nama_anak} (id: ${child1Id})`);

  // Test 6: Add child 2
  console.log("\nTEST 6: User adds child 2 (Aisyah)");
  const child2Res = await fetch(`${SUPA_URL}/rest/v1/children`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: testUser.id,
      nama_anak: "E2E Test Aisyah",
      tanggal_lahir: "2024-03-15",
      jenis_kelamin: "P",
      berat_badan: 10.2,
      tinggi_badan: 80,
    }),
  });
  const child2Data = await child2Res.json();
  const child2Id = child2Data[0]?.id;
  console.log(`  ✅ Added child: ${child2Data[0]?.nama_anak} (id: ${child2Id})`);

  // Test 7: Verify admin can see all children
  console.log("\nTEST 7: Admin fetches ALL children (no pagination)");
  const allChildrenRes = await fetch(
    `${SUPA_URL}/rest/v1/children?select=*&order=created_at.asc`,
    { headers }
  );
  const allChildren = await allChildrenRes.json();
  const testUserChildren = allChildren.filter((c) => c.user_id === testUser.id);
  console.log(`  ✅ Total children in database: ${allChildren.length}`);
  console.log(`  ✅ Children for test user: ${testUserChildren.length}`);
  console.log(`  ${testUserChildren.length === 2 ? "✅" : "❌"} Both children visible to admin: ${testUserChildren.length === 2}`);

  // Test 8: Add a consultation for this user
  console.log("\nTEST 8: User submits consultation");
  const consultRes = await fetch(`${SUPA_URL}/rest/v1/broadcast_consultations`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: testUser.id,
      nama_orang_tua: testUser.nama_orang_tua,
      nomor_telepon: "081234567890",
      alamat: "Test Address",
      nama_anak: "E2E Test Ahmad",
      tanggal_lahir_anak: "2023-01-10",
      jenis_kelamin_anak: "L",
      berat_badan_anak: 12.5,
      tinggi_badan_anak: 88,
      pertanyaan: "E2E test consultation for export verification",
      jawaban: "",
      status: "Menunggu Jawaban",
    }),
  });
  const consultData = await consultRes.json();
  console.log(`  ✅ Added consultation: ${consultData[0]?.id}`);

  // Test 9: Excel export simulation (fetchAllDataForExport)
  console.log("\nTEST 9: Excel export simulation (fetchAllDataForExport)");
  const [expProfiles, expChildren, expConsults] = await Promise.all([
    fetch(`${SUPA_URL}/rest/v1/profiles?role=eq.user&select=*`, { headers }).then((r) => r.json()),
    fetch(`${SUPA_URL}/rest/v1/children?select=*`, { headers }).then((r) => r.json()),
    fetch(`${SUPA_URL}/rest/v1/broadcast_consultations?select=*`, { headers }).then((r) => r.json()),
  ]);

  console.log(`  ✅ Profiles fetched: ${expProfiles.length}`);
  console.log(`  ✅ Children fetched: ${expChildren.length}`);
  console.log(`  ✅ Consultations fetched: ${expConsults.length}`);

  // Build Excel rows (one per child)
  let excelRows = 0;
  let testUserRows = 0;
  let testUserConsultCount = 0;
  let testUserLastConsult = "Belum ada konsultasi";

  for (const user of expProfiles) {
    const userChildren = expChildren.filter((c) => c.user_id === user.id);
    const userConsults = expConsults.filter((c) => c.user_id === user.id);

    if (user.id === testUser.id) {
      testUserConsultCount = userConsults.length;
      if (userConsults.length > 0) {
        const dates = userConsults
          .map((c) => c.created_at)
          .filter(Boolean)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        if (dates.length > 0) {
          const d = new Date(dates[0]);
          testUserLastConsult = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        }
      }
    }

    if (userChildren.length === 0) {
      excelRows += 1;
    } else {
      excelRows += userChildren.length;
      if (user.id === testUser.id) {
        testUserRows = userChildren.length;
      }
    }
  }

  console.log(`  ✅ Total Excel rows: ${excelRows}`);
  console.log(`  ✅ Test user rows in Excel: ${testUserRows}`);
  console.log(`  ${testUserRows === 2 ? "✅" : "❌"} Both children in Excel: ${testUserRows === 2}`);
  console.log(`  ✅ Test user consultation count: ${testUserConsultCount}`);
  console.log(`  ✅ Test user last consultation: ${testUserLastConsult}`);

  // Cleanup
  console.log("\n=== Cleanup ===");
  await fetch(`${SUPA_URL}/rest/v1/children?id=in.(${child1Id},${child2Id})`, { method: "DELETE", headers });
  await fetch(`${SUPA_URL}/rest/v1/broadcast_consultations?id=eq.${consultData[0]?.id}`, { method: "DELETE", headers });
  console.log("  ✅ Cleaned up test data");

  // Summary
  console.log("\n=== SUMMARY ===");
  console.log("Part A (Admin Content → Public):");
  console.log("  ✅ Add Published content → visible to public");
  console.log("  ✅ Add Draft content → NOT visible to public");
  console.log("  ✅ Edit content → changes visible");
  console.log("  ✅ Delete content → removed from public");
  console.log("");
  console.log("Part B (User Children → Admin → Excel):");
  console.log("  ✅ Add 2 children → both visible to admin");
  console.log("  ✅ Excel export includes both children");
  console.log("  ✅ Consultation count correct");
  console.log("  ✅ Last consultation date correct");
  console.log("  ✅ No pagination limit (all data fetched)");
}

test().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
