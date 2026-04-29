# Panduan Deploy Digital Safety Checklist ke Vercel
## Stack: Next.js + Supabase + Vercel

## Struktur Project

```text
digitalsafety/
├── lib/
│   ├── supabase.js         <- Koneksi Supabase client
│   └── checklistData.js    <- Data checklist
├── pages/
│   ├── _app.js
│   ├── index.js            <- Halaman utama
│   └── api/
│       ├── submit.js       <- POST: simpan hasil checklist
│       └── stats.js        <- GET: statistik dan leaderboard kelas
├── sql/
│   └── schema.sql          <- Schema PostgreSQL untuk Supabase
├── .env.local.example
├── .env.local              <- dibuat sendiri, jangan commit
└── package.json
```

## Setup Supabase

1. Buka `https://supabase.com` dan buat project baru.
2. Buka menu **SQL Editor**.
3. Salin seluruh isi `sql/schema.sql`.
4. Jalankan query tersebut di SQL Editor.
5. Buka **Project Settings -> API**.
6. Salin:
   - Project URL
   - anon public key

## Environment Variables

Buat `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Untuk Vercel, masukkan dua variable yang sama di:

`Project Settings -> Environment Variables`

Pastikan diset untuk Production, Preview, dan Development.

## Development Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Deploy ke Vercel

1. Push project ke GitHub.
2. Import repository di Vercel.
3. Framework preset: Next.js.
4. Tambahkan environment variables Supabase.
5. Klik Deploy.

## Cek Data di Supabase

Gunakan **Table Editor** untuk melihat tabel:

- `checklist_results`

Gunakan **SQL Editor** untuk cek statistik:

```sql
SELECT * FROM checklist_results ORDER BY created_at DESC;
SELECT * FROM view_statistik_global;
SELECT * FROM view_rata_kelas;
```

## Endpoint Backend

| Endpoint | Method | Fungsi |
|----------|--------|--------|
| `/api/submit` | POST | Simpan hasil checklist ke Supabase |
| `/api/stats` | GET | Ambil statistik global dan per kelas |
| `/api/stats?kelas=XI.H` | GET | Filter statistik untuk kelas tertentu |

## Troubleshooting

### Error: supabaseUrl is required

- Pastikan `.env.local` berisi `NEXT_PUBLIC_SUPABASE_URL`.
- Restart `npm run dev` setelah mengubah env.

### Error: invalid API key

- Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` berisi anon public key, bukan service role key.

### Error: relation does not exist

- Jalankan ulang `sql/schema.sql` di Supabase SQL Editor.

### Error: permission denied / RLS

- Pastikan bagian policy RLS di `sql/schema.sql` ikut dijalankan.

## Keamanan

- Jangan commit `.env.local`.
- Jangan taruh service role key di frontend.
- App ini memakai anon key dan RLS policy untuk insert/select yang dibutuhkan checklist.
