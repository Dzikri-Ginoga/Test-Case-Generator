

## 🔖 Legenda Status & Tipe

| Simbol | Keterangan |
|--------|-----------|
| ✅ Positive | Skenario normal/berhasil (happy path) |
| ❌ Negative | Input tidak valid / skenario gagal |
| ⚠️ Edge | Kondisi batas / perlakuan tidak wajar |

---

## Kategori 1 — Pembuatan Task (Create)

| Test Case ID | Modul | Tipe | Deskripsi Pengujian | Pre-conditions | Test Steps | Expected Result |
|---|---|---|---|---|---|---|
| TC-CR-001 | Pembuatan Task | ✅ Positive | Membuat task baru dengan teks valid | Halaman Task List terbuka, input field tersedia | 1. Klik pada input field "Add new task" (atau sejenisnya) <br> 2. Ketik teks: `"Belajar Testing"` <br> 3. Tekan tombol **Add** atau tekan **Enter** | Task `"Belajar Testing"` muncul di daftar dengan status **Active**; input field kembali kosong |
| TC-CR-002 | Pembuatan Task | ✅ Positive | Membuat beberapa task secara berurutan | Halaman terbuka, daftar task kosong | 1. Tambahkan task `"Task A"` → tekan Enter <br> 2. Tambahkan task `"Task B"` → tekan Enter <br> 3. Tambahkan task `"Task C"` → tekan Enter | Ketiga task muncul di daftar secara berurutan dengan status **Active**; urutan sesuai input |
| TC-CR-003 | Pembuatan Task | ✅ Positive | Membuat task dengan karakter alfanumerik dan spasi | Halaman terbuka | 1. Ketik `"Beli susu 2 liter"` <br> 2. Tekan Enter | Task `"Beli susu 2 liter"` berhasil ditambahkan ke daftar |
| TC-CR-004 | Pembuatan Task | ✅ Positive | Membuat task dengan karakter spesial yang umum | Halaman terbuka | 1. Ketik `"Meeting: follow-up Q4 (urgent!)"` <br> 2. Tekan Enter | Task berhasil ditambahkan dengan teks tersimpan persis seperti yang diketik |
| TC-CR-005 | Pembuatan Task | ❌ Negative | Mencoba menambahkan task dengan input kosong | Halaman terbuka, input field kosong | 1. Klik input field, pastikan kosong <br> 2. Tekan tombol **Add** atau tekan **Enter** | Tidak ada task baru yang ditambahkan ke daftar; sistem menampilkan pesan validasi (misalnya: *"Task tidak boleh kosong"*) atau tombol Add dalam kondisi disabled |
| TC-CR-006 | Pembuatan Task | ❌ Negative | Mencoba menambahkan task yang hanya berisi spasi | Halaman terbuka | 1. Ketik `"     "` (5 spasi) di input field <br> 2. Tekan Enter | Tidak ada task baru ditambahkan; sistem memperlakukan input spasi saja sebagai input kosong (whitespace-only validation) |
| TC-CR-007 | Pembuatan Task | ⚠️ Edge | Membuat task dengan teks sangat panjang (>200 karakter) | Halaman terbuka | 1. Ketik string sepanjang 250 karakter ke input field <br> 2. Tekan Enter | Sistem menerima teks dan menampilkan task dengan layout yang tidak rusak (teks ter-wrap atau ter-truncate dengan graceful); tidak terjadi overflow pada UI |
| TC-CR-008 | Pembuatan Task | ⚠️ Edge | Membuat task dengan karakter khusus HTML/script (XSS test) | Halaman terbuka | 1. Ketik `<script>alert('XSS')</script>` di input field <br> 2. Tekan Enter | Teks ditampilkan sebagai **plain text** (ter-escape dengan benar); tidak ada dialog alert yang muncul; tidak ada eksekusi script ⚠️ *Krusial: kegagalan berarti celah keamanan XSS* |
| TC-CR-009 | Pembuatan Task | ⚠️ Edge | Membuat task dengan teks yang identik dengan task yang sudah ada | Sudah terdapat task `"Belajar Testing"` di daftar | 1. Ketik `"Belajar Testing"` (duplikat) di input field <br> 2. Tekan Enter | Sistem menerima duplikat dan menambahkan task baru (task kedua dengan teks sama muncul di daftar), ATAU menampilkan peringatan duplikat — dokumentasikan perilaku yang diimplementasikan |

---

## Kategori 2 — Modifikasi Task (Update)

| Test Case ID | Modul | Tipe | Deskripsi Pengujian | Pre-conditions | Test Steps | Expected Result |
|---|---|---|---|---|---|---|
| TC-UP-001 | Modifikasi Task | ✅ Positive | Mengedit teks task yang sudah ada | Terdapat minimal 1 task di daftar | 1. Double-klik (atau klik ikon edit) pada task `"Task Lama"` <br> 2. Input field task berubah ke mode edit <br> 3. Hapus teks lama, ketik `"Task Baru"` <br> 4. Tekan Enter atau klik tombol **Save** | Teks task berubah menjadi `"Task Baru"`; perubahan tersimpan dan tampil di daftar |
| TC-UP-002 | Modifikasi Task | ✅ Positive | Membatalkan edit task (tanpa menyimpan perubahan) | Terdapat minimal 1 task di daftar | 1. Masuk ke mode edit pada suatu task <br> 2. Ubah teks ke `"Teks Sementara"` <br> 3. Tekan **Escape** atau klik tombol **Cancel** | Teks task kembali ke nilai semula; perubahan tidak tersimpan |
| TC-UP-003 | Modifikasi Task | ❌ Negative | Mencoba menyimpan edit dengan input kosong | Mode edit aktif pada suatu task | 1. Hapus seluruh teks pada input edit <br> 2. Tekan Enter atau klik **Save** | Sistem menolak menyimpan; menampilkan pesan validasi atau mengembalikan ke teks asal (rollback) — tidak boleh tersimpan task kosong |
| TC-UP-004 | Modifikasi Task | ❌ Negative | Mencoba menyimpan edit dengan hanya spasi | Mode edit aktif pada suatu task | 1. Hapus semua teks, ketik `"   "` (spasi saja) <br> 2. Tekan Enter | Sistem menolak input; berlaku seperti TC-UP-003 |
| TC-UP-005 | Modifikasi Task | ⚠️ Edge | Mengedit task saat filter aktif (misalnya filter "Active") | Filter "Active" sedang aktif; task yang akan diedit berstatus Active | 1. Dalam kondisi filter "Active" aktif <br> 2. Edit teks task tanpa mengubah statusnya <br> 3. Tekan Enter | Task tetap tampil dalam filter "Active" setelah tersimpan; teks berhasil diperbarui |

---

## Kategori 3 — Penghapusan Task (Delete)

| Test Case ID | Modul | Tipe | Deskripsi Pengujian | Pre-conditions | Test Steps | Expected Result |
|---|---|---|---|---|---|---|
| TC-DL-001 | Penghapusan Task | ✅ Positive | Menghapus satu task dari daftar | Terdapat minimal 2 task di daftar | 1. Identifikasi task yang akan dihapus <br> 2. Klik tombol **Delete** (ikon ✕ atau sejenisnya) pada task tersebut | Task hilang dari daftar; task-task lain tetap ada dan tidak terpengaruh |
| TC-DL-002 | Penghapusan Task | ✅ Positive | Menghapus semua task yang berstatus Completed sekaligus ("Clear Completed") | Terdapat beberapa task Completed dan Active | 1. Klik tombol **Clear Completed** (jika tersedia) | Semua task berstatus Completed dihapus sekaligus; task berstatus Active tetap ada di daftar |
| TC-DL-003 | Penghapusan Task | ✅ Positive | Menghapus task terakhir sehingga daftar menjadi kosong | Tersisa 1 task di daftar | 1. Klik tombol **Delete** pada satu-satunya task yang ada | Task terhapus; daftar menampilkan **empty state** (misalnya pesan *"Tidak ada task"* atau ilustrasi kosong) |
| TC-DL-004 | Penghapusan Task | ⚠️ Edge | Mengklik "Clear Completed" saat tidak ada task berstatus Completed | Semua task berstatus Active | 1. Klik tombol **Clear Completed** | Tidak ada perubahan pada daftar; tidak ada error; tombol dapat di-disabled atau diabaikan dengan graceful |

---

## Kategori 4 — Manajemen Status Task (Active ↔ Completed)

| Test Case ID | Modul | Tipe | Deskripsi Pengujian | Pre-conditions | Test Steps | Expected Result |
|---|---|---|---|---|---|---|
| TC-ST-001 | Manajemen Status | ✅ Positive | Menandai task Active menjadi Completed | Terdapat minimal 1 task berstatus Active | 1. Klik checkbox / tombol pada task berstatus Active | Status task berubah menjadi **Completed**; task menampilkan indikator visual "selesai" (misalnya teks ter-strikethrough, warna berubah, checkbox tercentang) |
| TC-ST-002 | Manajemen Status | ✅ Positive | Mengembalikan task Completed menjadi Active (toggle off) | Terdapat minimal 1 task berstatus Completed | 1. Klik checkbox pada task berstatus Completed | Status task berubah kembali menjadi **Active**; indikator visual "selesai" menghilang |
| TC-ST-003 | Manajemen Status | ✅ Positive | Menandai semua task sebagai Completed sekaligus ("Toggle All") | Terdapat beberapa task Active | 1. Klik tombol **Toggle All** / **Mark All** (jika tersedia) | Semua task berubah status menjadi **Completed** |
| TC-ST-004 | Manajemen Status | ✅ Positive | Mengembalikan semua task ke Active via Toggle All | Semua task berstatus Completed | 1. Klik tombol **Toggle All** kembali | Semua task berubah status menjadi **Active** |
| TC-ST-005 | Manajemen Status | ✅ Positive | Counter task Active berkurang saat task ditandai Completed | Tersedia counter "X items left"; terdapat 3 task Active | 1. Tandai 1 task sebagai Completed | Counter menampilkan **"2 items left"** (berkurang 1) |
| TC-ST-006 | Manajemen Status | ✅ Positive | Counter task Active bertambah saat task Completed dikembalikan ke Active | Counter menampilkan "2 items left"; ada 1 task Completed | 1. Klik checkbox pada task Completed untuk mengembalikannya ke Active | Counter memperbarui menjadi **"3 items left"** |
| TC-ST-007 | Manajemen Status | ⚠️ Edge | Toggle All ketika sebagian task sudah Completed | 3 task Active, 2 task Completed | 1. Klik **Toggle All** | Semua 5 task berubah menjadi **Completed**; klik Toggle All kedua kali → semua kembali menjadi **Active** |

---

## Kategori 5 — Dinamika Filter (All, Active, Completed)

| Test Case ID | Modul | Tipe | Deskripsi Pengujian | Pre-conditions | Test Steps | Expected Result |
|---|---|---|---|---|---|---|
| TC-FI-001 | Dinamika Filter | ✅ Positive | Filter "All" menampilkan seluruh task | Terdapat campuran task Active dan Completed | 1. Klik tab/tombol filter **All** | Semua task (Active + Completed) ditampilkan; tidak ada yang tersembunyi |
| TC-FI-002 | Dinamika Filter | ✅ Positive | Filter "Active" hanya menampilkan task berstatus Active | Terdapat 3 task Active dan 2 task Completed | 1. Klik filter **Active** | Hanya 3 task Active yang tampil; 2 task Completed tersembunyi |
| TC-FI-003 | Dinamika Filter | ✅ Positive | Filter "Completed" hanya menampilkan task berstatus Completed | Terdapat 3 task Active dan 2 task Completed | 1. Klik filter **Completed** | Hanya 2 task Completed yang tampil; 3 task Active tersembunyi |
| TC-FI-004 | Dinamika Filter | ✅ Positive | Filter diperbarui secara dinamis tanpa page refresh saat task ditandai Completed | Filter "Active" aktif; terdapat 3 task Active | 1. Dalam kondisi filter "Active" aktif <br> 2. Tandai 1 task sebagai Completed | Task yang baru ditandai Completed **langsung menghilang** dari tampilan filter "Active" secara real-time tanpa refresh halaman |
| TC-FI-005 | Dinamika Filter | ✅ Positive | Filter "Completed" diperbarui dinamis saat task baru selesai ditandai | Filter "Completed" aktif; terdapat 1 task Completed, 2 task Active (tersembunyi) | 1. Dalam kondisi filter "Completed" aktif <br> 2. Tandai 1 task Active menjadi Completed (toggle) | Task yang baru diselesaikan **langsung muncul** di tampilan filter "Completed" tanpa refresh |
| TC-FI-006 | Dinamika Filter | ✅ Positive | Filter "Active" diperbarui dinamis saat task Completed dikembalikan ke Active | Filter "Completed" aktif | 1. Klik checkbox task Completed untuk mengembalikannya ke Active | Task tersebut **langsung menghilang** dari tampilan filter "Completed" |
| TC-FI-007 | Dinamika Filter | ✅ Positive | Menambah task baru saat filter "Active" sedang aktif | Filter "Active" aktif | 1. Tambahkan task baru `"Task Baru"` via input field | Task baru langsung muncul di tampilan filter "Active" (karena task baru default berstatus Active) |
| TC-FI-008 | Dinamika Filter | ✅ Positive | Task yang dihapus langsung hilang dari filter yang sedang aktif | Filter "Active" aktif; task target berstatus Active | 1. Klik tombol delete pada salah satu task Active | Task tersebut langsung hilang dari tampilan filter "Active" tanpa refresh |
| TC-FI-009 | Dinamika Filter | ❌ Negative | Filter "Active" menampilkan empty state jika tidak ada task Active | Semua task berstatus Completed | 1. Klik filter **Active** | Tampilan menunjukkan **empty state** yang informatif (misalnya: *"Tidak ada task aktif"*) — tidak ada error, tidak crash |
| TC-FI-010 | Dinamika Filter | ❌ Negative | Filter "Completed" menampilkan empty state jika tidak ada task Completed | Semua task berstatus Active | 1. Klik filter **Completed** | Tampilan menunjukkan **empty state** yang informatif — tidak ada error |
| TC-FI-011 | Dinamika Filter | ⚠️ Edge | Menambah task baru saat filter "Completed" sedang aktif | Filter "Completed" aktif | 1. Tambahkan task baru via input field | Task baru **tidak muncul** di tampilan filter "Completed" (karena task baru default berstatus Active); task tersimpan dengan benar dan akan muncul jika filter diubah ke "All" atau "Active" |
| TC-FI-012 | Dinamika Filter | ⚠️ Edge | State filter tetap sama setelah task diedit | Filter "Active" aktif | 1. Edit teks task tanpa mengubah statusnya <br> 2. Simpan perubahan | Filter tetap pada "Active"; task tetap tampil dalam filter yang sama |

---

## Kategori 6 — Pembacaan Daftar Task (Read)

| Test Case ID | Modul | Tipe | Deskripsi Pengujian | Pre-conditions | Test Steps | Expected Result |
|---|---|---|---|---|---|---|
| TC-RD-001 | Pembacaan Task | ✅ Positive | Daftar task ditampilkan dengan benar saat halaman pertama dibuka | - | 1. Buka URL halaman Task List | Daftar task tampil; jika ada data persisten (localStorage/server), data dimuat dengan benar; jika tidak ada data, ditampilkan empty state |
| TC-RD-002 | Pembacaan Task | ✅ Positive | Urutan tampilan task sesuai urutan pembuatan | - | 1. Tambahkan task "A", kemudian "B", kemudian "C" <br> 2. Observasi urutan tampilan | Task tampil berurutan: "A" paling atas, "C" paling bawah (FIFO), kecuali ada sorting lain yang didefinisikan |
| TC-RD-003 | Pembacaan Task | ✅ Positive | Counter "X items left" menampilkan jumlah task Active yang akurat | Terdapat 5 task (3 Active, 2 Completed) | 1. Observasi counter | Counter menampilkan **"3 items left"** dengan akurat |

---

## Kategori 7 — Persistensi Data

| Test Case ID | Modul | Tipe | Deskripsi Pengujian | Pre-conditions | Test Steps | Expected Result |
|---|---|---|---|---|---|---|
| TC-PS-001 | Persistensi Data | ✅ Positive | Data task tetap ada setelah halaman di-refresh | Terdapat beberapa task di daftar | 1. Catat daftar task yang ada <br> 2. Refresh halaman (F5) | Daftar task muncul kembali dengan data yang sama; tidak ada data yang hilang ⚠️ *Berlaku jika aplikasi menggunakan localStorage atau backend* |
| TC-PS-002 | Persistensi Data | ✅ Positive | Status task (Active/Completed) tetap terjaga setelah refresh | Terdapat task dengan status Completed | 1. Tandai beberapa task sebagai Completed <br> 2. Refresh halaman | Status Completed tetap tersimpan; task yang ditandai selesai masih tampil sebagai Completed |
| TC-PS-003 | Persistensi Data | ⚠️ Edge | Perilaku aplikasi setelah localStorage dihapus manual | Aplikasi menggunakan localStorage | 1. Buka DevTools → Application → Clear Storage <br> 2. Refresh halaman | Halaman tampil dalam kondisi bersih (empty state) tanpa error; tidak ada crash atau data corrupt |

---

## 📝 Ringkasan Cakupan Pengujian

| Kategori | Jumlah TC | Positive | Negative | Edge |
|---|---|---|---|---|
| Pembuatan Task (Create) | 9 | 4 | 2 | 3 |
| Modifikasi Task (Update) | 5 | 2 | 2 | 1 |
| Penghapusan Task (Delete) | 4 | 3 | 0 | 1 |
| Manajemen Status | 7 | 6 | 0 | 1 |
| Dinamika Filter | 12 | 8 | 2 | 2 |
| Pembacaan Task (Read) | 3 | 3 | 0 | 0 |
| Persistensi Data | 3 | 2 | 0 | 1 |
| **Total** | **43** | **28** | **6** | **9** |

---

## 📌 Catatan Penting

> **TC-CR-008 (XSS)** — Krusial untuk keamanan. Kegagalan test ini mengindikasikan celah keamanan Cross-Site Scripting yang harus diprioritaskan segera.

> **TC-FI-004 s/d TC-FI-006** — Merupakan inti dari persyaratan "dinamis tanpa refresh". Ketiga test ini memvalidasi reaktivitas UI secara langsung dan harus dieksekusi dengan observasi ketat terhadap ada/tidaknya page reload.

> **TC-PS-001 & TC-PS-002** — Hanya relevan dan dapat dieksekusi jika aplikasi memiliki mekanisme penyimpanan data (localStorage, sessionStorage, atau backend API). Tandai sebagai *N/A* jika tidak ada persistensi.

> **TC-CR-009 (Duplikat)** — Perilaku yang "benar" bergantung pada spesifikasi produk. Eksekutor perlu mengkonfirmasi behavior yang diharapkan dengan Product Owner sebelum menentukan Pass/Fail.

> **TC-UP-001 (Trigger Edit)** — Mekanisme masuk ke mode edit (double-click, ikon, dll.) harus dikonfirmasi sesuai implementasi aktual aplikasi sebelum eksekusi.
