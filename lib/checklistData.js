// lib/checklistData.js
// Data checklist keamanan digital — sumber kebenaran tunggal
// Dipakai baik di frontend maupun backend

export const CHECKLIST_SECTIONS = [
  {
    id: 'password',
    label: '🔐 Password & Akun',
    items: [
      {
        id: 0,
        txt: 'Menggunakan password yang kuat dan unik',
        note: 'Campuran huruf besar, kecil, angka & simbol — minimal 12 karakter',
        tag: 'Dasar',
        tagClass: 't-basic',
      },
      {
        id: 1,
        txt: 'Tidak menggunakan password yang sama di banyak akun',
        note: 'Setiap akun penting punya password yang berbeda',
        tag: 'Penting',
        tagClass: 't-penting',
      },
      {
        id: 2,
        txt: 'Mengaktifkan verifikasi 2 langkah (2FA) di akun utama',
        note: 'Google, email, Instagram, TikTok, WhatsApp — semua aktifkan 2FA',
        tag: 'Penting',
        tagClass: 't-penting',
      },
      {
        id: 3,
        txt: 'Menggunakan password manager',
        note: 'Contoh: Bitwarden (gratis), 1Password — simpan password dengan aman',
        tag: 'Advanced',
        tagClass: 't-adv',
      },
    ],
  },
  {
    id: 'phishing',
    label: '🥷 Phishing & Penipuan',
    items: [
      {
        id: 4,
        txt: 'Tidak pernah membagikan OTP atau kode verifikasi',
        note: 'Termasuk kepada yang mengaku dari bank, ojol, atau marketplace',
        tag: 'Penting',
        tagClass: 't-penting',
      },
      {
        id: 5,
        txt: 'Selalu cek URL sebelum mengklik link',
        note: 'Waspada link di WhatsApp, DM Instagram, atau email tidak dikenal',
        tag: 'Dasar',
        tagClass: 't-basic',
      },
      {
        id: 6,
        txt: 'Tidak mengunduh APK dari sumber tidak resmi',
        note: 'Hanya install dari Play Store atau App Store resmi',
        tag: 'Penting',
        tagClass: 't-penting',
      },
      {
        id: 7,
        txt: 'Tidak tergiur hadiah atau promo mencurigakan',
        note: '"Kamu menangkan iPhone!" → hampir pasti penipuan',
        tag: 'Dasar',
        tagClass: 't-basic',
      },
    ],
  },
  {
    id: 'privasi',
    label: '🕵️ Privasi Online',
    items: [
      {
        id: 8,
        txt: 'Mengatur akun media sosial ke mode privat',
        note: 'Instagram, TikTok, Twitter/X tidak perlu diakses semua orang',
        tag: 'Privasi',
        tagClass: 't-priv',
      },
      {
        id: 9,
        txt: 'Tidak memposting info pribadi sensitif secara publik',
        note: 'Nomor HP, alamat, foto KTP / KK — jangan pernah diposting',
        tag: 'Privasi',
        tagClass: 't-priv',
      },
      {
        id: 10,
        txt: 'Membatasi izin aplikasi yang tidak perlu',
        note: 'Pengaturan → Aplikasi → Izin (kamera, lokasi, kontak)',
        tag: 'Privasi',
        tagClass: 't-priv',
      },
    ],
  },
  {
    id: 'perangkat',
    label: '📱 Perangkat & Update',
    items: [
      {
        id: 11,
        txt: 'Selalu logout setelah pakai komputer umum',
        note: 'Komputer sekolah, lab komputer, warnet — wajib logout',
        tag: 'Dasar',
        tagClass: 't-basic',
      },
      {
        id: 12,
        txt: 'Rutin mengupdate sistem operasi dan aplikasi',
        note: 'Update menutup celah keamanan yang bisa dieksploitasi',
        tag: 'Penting',
        tagClass: 't-penting',
      },
      {
        id: 13,
        txt: 'Menggunakan lock screen (PIN, sidik jari, atau password)',
        note: 'Jangan biarkan HP tanpa pengaman sama sekali',
        tag: 'Dasar',
        tagClass: 't-basic',
      },
      {
        id: 14,
        txt: 'Berhati-hati saat terhubung ke WiFi publik',
        note: 'Hindari login akun penting di WiFi kafe/mal/sekolah tanpa VPN',
        tag: 'Advanced',
        tagClass: 't-adv',
      },
    ],
  },
];

export const TOTAL_ITEMS = CHECKLIST_SECTIONS.reduce(
  (sum, s) => sum + s.items.length, 0
);

export function hitungKategori(pct) {
  if (pct >= 85) return 'Digital Guardian';
  if (pct >= 60) return 'Cukup Aman';
  return 'Perlu Waspada';
}
