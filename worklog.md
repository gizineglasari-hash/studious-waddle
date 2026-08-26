---
Task ID: 1
Agent: main (Super Z)
Task: Fix delete user button (data muncul lagi setelah refresh) dan sinkronisasi data anak di admin dashboard

Work Log:
- Investigasi root cause: Admin login via localStorage (BUKAN Supabase Auth), sehingga auth.uid() = null. RLS policy yang menggunakan auth.uid() tidak berlaku untuk admin.
- Bug 1 (delete tidak berfungsi): Tabel profiles/children/notifications/consultations tidak punya policy DELETE untuk anon role. deleteUser() juga tidak meng-await operasi Supabase, sehingga toast "terhapus" muncul sebelum operasi selesai/gagal.
- Bug 2 (data anak tidak sinkron): refreshData() hanya fetch children untuk currentUserId (admin). Saat admin login, currentUserId = null, jadi tidak ada children yang di-fetch.
- Buat file SQL baru: /home/z/my-project/supabase-fix-admin-delete.sql - menambahkan policy DELETE untuk anon+authenticated di 4 tabel (profiles, children, notifications, consultations).
- Edit /home/z/my-project/src/lib/gemas/auth-store.ts:
  * Ubah signature deleteUser & deleteConsultation menjadi async (Promise<{success, message}>)
  * Implementasi deleteUser: optimistic local delete → await semua operasi Supabase (5 tabel dengan urutan FK yang benar) → verifikasi dengan SELECT → rollback jika gagal → refreshData()
  * Implementasi deleteConsultation: pola yang sama dengan verifikasi
  * Fix refreshData: saat admin, fetch ALL children (tanpa filter user_id); tambah flag childrenFetchOk & usersFetchOk agar state selalu di-overwrite saat fetch berhasil (bahkan jika 0 hasil) - penting setelah delete
- Edit /home/z/my-project/src/components/views/admin/AdminUsersView.tsx:
  * Tambah state `deleting` untuk loading indicator
  * Tambah useEffect untuk refreshData saat view mount
  * Ubah delete handler menjadi async dengan try/catch/finally, loading state, dan refresh setelah delete
- Edit /home/z/my-project/src/components/views/admin/AdminConsultationsView.tsx:
  * Pola yang sama: async handler, loading state, refresh setelah delete
- Verifikasi TypeScript: tidak ada error baru di file yang diubah

Stage Summary:
- Root cause utama: RLS policies di Supabase tidak mengizinkan admin (anon role) untuk DELETE. SQL fix perlu dijalankan user di Supabase Dashboard.
- Code fix sudah complete: deleteUser/deleteConsultation sekarang async dengan verification & rollback, refreshData fetch all children untuk admin.
- File SQL yang harus dijalankan user: /home/z/my-project/supabase-fix-admin-delete.sql
- Setelah SQL dijalankan, deploy otomatis via GitHub push akan mengaktifkan fix di production.
