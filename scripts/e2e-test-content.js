#!/usr/bin/env node
/**
 * End-to-end test simulating Admin Dashboard → Edit Website flow
 * Tests: Add → Edit → Draft toggle → Publish → Delete
 * Verifies public visibility at each step.
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

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPublishedContent() {
  // Public visitors only see is_active = true content
  // Note: After v2 RLS, anon can see all content. App filters is_active=true.
  // To simulate "public view", we filter on the client side.
  const res = await fetch(
    `${SUPA_URL}/rest/v1/${TABLE}?select=id,title,description,category,content_type,is_active,display_order&order=display_order.asc`,
    { headers }
  );
  const data = await res.json();
  const all = Array.isArray(data) ? data : [];
  // Filter to only show published (is_active=true) - this is what VideoEdukasiView does
  return all.filter((c) => c.is_active === true);
}

async function fetchAllContent() {
  // Admin view - fetch all content (active + inactive)
  // Note: with RLS enabled, anon can only see is_active=true.
  // In real app, admin uses authenticated session OR we use service_role key.
  // For testing, we use anon - this matches the app's behavior.
  const res = await fetch(
    `${SUPA_URL}/rest/v1/${TABLE}?select=id,title,is_active&order=display_order.asc`,
    { headers }
  );
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function test() {
  console.log("=== END-TO-END TEST: Admin Edit Website → Public Video Edukasi ===\n");

  // ============================================
  // TEST 1: Admin adds new video content (Published)
  // ============================================
  console.log("TEST 1: Admin adds new published video content");
  const addRes = await fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "E2E Test: Video MP-ASI 6-8 Bulan",
      description: "Video panduan pemberian MP-ASI untuk bayi 6-8 bulan dengan resep bubur tim labu kuning.",
      content_type: "video",
      category: "MP-ASI",
      video_source: "youtube",
      external_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail_url: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      is_active: true,
      display_order: 100,
      duration: "5:30",
      created_by: "admin@gemas.id",
    }),
  });
  const added = await addRes.json();
  if (!addRes.ok) {
    console.log("  ❌ FAILED to add content:", JSON.stringify(added));
    return;
  }
  const contentId = added[0].id;
  console.log(`  ✅ Added content with ID: ${contentId}`);
  console.log(`  ✅ Title: ${added[0].title}`);
  console.log(`  ✅ Status: ${added[0].is_active ? "Published" : "Draft"}`);

  // Verify it's visible to public
  await delay(500);
  let published = await fetchPublishedContent();
  const isVisible1 = published.some((c) => c.id === contentId && c.is_active === true);
  console.log(`  ${isVisible1 ? "✅" : "❌"} Visible to public (is_active=true): ${isVisible1}`);
  console.log("");

  // ============================================
  // TEST 2: Admin edits the content
  // ============================================
  console.log("TEST 2: Admin edits content title and description");
  const editRes = await fetch(
    `${SUPA_URL}/rest/v1/${TABLE}?id=eq.${contentId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        title: "E2E Test: Video MP-ASI 6-8 Bulan [UPDATED]",
        description: "Updated description: panduan lengkap MP-ASI untuk bayi 6-8 bulan.",
      }),
    }
  );
  const edited = await editRes.json();
  console.log(`  ✅ Updated title: ${edited[0].title}`);
  console.log(`  ✅ Updated description: ${edited[0].description.substring(0, 50)}...`);

  // Verify edit is visible
  await delay(500);
  published = await fetchPublishedContent();
  const editedContent = published.find((c) => c.id === contentId);
  const editVisible = editedContent && editedContent.title.includes("[UPDATED]");
  console.log(`  ${editVisible ? "✅" : "❌"} Edit visible to public: ${editVisible}`);
  console.log("");

  // ============================================
  // TEST 3: Admin changes status to Draft (unpublish)
  // ============================================
  console.log("TEST 3: Admin changes status Published → Draft");
  await fetch(`${SUPA_URL}/rest/v1/${TABLE}?id=eq.${contentId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ is_active: false }),
  });

  await delay(500);
  published = await fetchPublishedContent();
  // Public should NOT see draft content
  const isVisible3 = published.some((c) => c.id === contentId && c.is_active === true);
  console.log(`  ${!isVisible3 ? "✅" : "❌"} Content NOT visible to public (Draft): ${!isVisible3}`);
  console.log("");

  // ============================================
  // TEST 4: Admin changes status Draft → Published
  // ============================================
  console.log("TEST 4: Admin changes status Draft → Published");
  await fetch(`${SUPA_URL}/rest/v1/${TABLE}?id=eq.${contentId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ is_active: true }),
  });

  await delay(500);
  published = await fetchPublishedContent();
  const isVisible4 = published.some((c) => c.id === contentId && c.is_active === true);
  console.log(`  ${isVisible4 ? "✅" : "❌"} Content visible to public (Published): ${isVisible4}`);
  console.log("");

  // ============================================
  // TEST 5: Admin deletes content
  // ============================================
  console.log("TEST 5: Admin deletes content");
  const delRes = await fetch(`${SUPA_URL}/rest/v1/${TABLE}?id=eq.${contentId}`, {
    method: "DELETE",
    headers,
  });
  console.log(`  ${delRes.ok ? "✅" : "❌"} DELETE returned: ${delRes.status}`);

  await delay(500);
  published = await fetchPublishedContent();
  const isVisible5 = published.some((c) => c.id === contentId);
  console.log(`  ${!isVisible5 ? "✅" : "❌"} Content NOT visible to public (deleted): ${!isVisible5}`);
  console.log("");

  // ============================================
  // TEST 6: Verify persistence (refresh simulation)
  // ============================================
  console.log("TEST 6: Verify persistence after refresh");
  // Add a new content, wait, then fetch again
  const persistRes = await fetch(`${SUPA_URL}/rest/v1/${TABLE}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: "E2E Persistence Test",
      description: "Should persist across refreshes",
      content_type: "pdf",
      category: "Gizi Seimbang",
      is_active: true,
      display_order: 200,
    }),
  });
  const persisted = await persistRes.json();
  const persistId = persisted[0].id;
  console.log(`  ✅ Added content for persistence test: ${persistId}`);

  // Simulate "refresh" by fetching again
  await delay(1000);
  published = await fetchPublishedContent();
  const stillThere = published.find((c) => c.id === persistId);
  console.log(`  ${stillThere ? "✅" : "❌"} Content persists after refresh: ${!!stillThere}`);
  console.log(`  ${stillThere && stillThere.is_active ? "✅" : "❌"} Still Published: ${stillThere && stillThere.is_active}`);

  // Cleanup
  await fetch(`${SUPA_URL}/rest/v1/${TABLE}?id=eq.${persistId}`, { method: "DELETE", headers });
  console.log("  ✅ Cleanup: deleted persistence test content");

  console.log("\n=== SUMMARY ===");
  console.log("All end-to-end tests completed. If all ✅, the system works correctly.");
  console.log("");
  console.log("What was tested:");
  console.log("  1. Admin adds new content → appears on public page");
  console.log("  2. Admin edits content → changes appear on public page");
  console.log("  3. Admin sets to Draft → disappears from public page");
  console.log("  4. Admin sets to Published → reappears on public page");
  console.log("  5. Admin deletes → disappears from public page");
  console.log("  6. Data persists across refreshes");
}

test().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
