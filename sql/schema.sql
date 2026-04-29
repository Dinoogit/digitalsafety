-- ============================================================
-- Digital Safety Checklist - SMAN 1 Tambun Selatan
-- Database Schema untuk PostgreSQL
-- ============================================================

-- Buat database dari shell psql jika belum ada:
--   CREATE DATABASE digitalsafety_db;
-- Lalu jalankan file ini di database digitalsafety_db:
--   psql -d digitalsafety_db -f sql/schema.sql

-- ============================================================
-- TABEL UTAMA: hasil checklist siswa
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_results (
  id             BIGSERIAL PRIMARY KEY,
  nama           VARCHAR(100) NOT NULL,
  kelas          VARCHAR(20)  NOT NULL,
  skor           SMALLINT     NOT NULL DEFAULT 0,
  jumlah_centang SMALLINT     NOT NULL DEFAULT 0,
  total_item     SMALLINT     NOT NULL DEFAULT 15,
  checked_items  JSONB        NOT NULL,
  kategori       VARCHAR(32)  NOT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT checklist_results_skor_range
    CHECK (skor >= 0 AND skor <= 100),
  CONSTRAINT checklist_results_jumlah_centang_range
    CHECK (jumlah_centang >= 0 AND jumlah_centang <= total_item),
  CONSTRAINT checklist_results_total_item_positive
    CHECK (total_item > 0),
  CONSTRAINT checklist_results_kategori_check
    CHECK (kategori IN ('Digital Guardian', 'Cukup Aman', 'Perlu Waspada'))
);

COMMENT ON TABLE checklist_results IS
  'Hasil checklist keamanan digital siswa SMAN 1 Tambun Selatan';
COMMENT ON COLUMN checklist_results.nama IS
  'Nama lengkap siswa';
COMMENT ON COLUMN checklist_results.kelas IS
  'Kelas siswa, contoh: XI.H';
COMMENT ON COLUMN checklist_results.skor IS
  'Persentase skor 0-100';
COMMENT ON COLUMN checklist_results.jumlah_centang IS
  'Jumlah item yang dicentang';
COMMENT ON COLUMN checklist_results.total_item IS
  'Total item checklist';
COMMENT ON COLUMN checklist_results.checked_items IS
  'Array index item yang dicentang (0-based)';
COMMENT ON COLUMN checklist_results.kategori IS
  'Kategori hasil';
COMMENT ON COLUMN checklist_results.created_at IS
  'Waktu pengisian';

CREATE INDEX IF NOT EXISTS idx_checklist_results_nama
  ON checklist_results (nama);
CREATE INDEX IF NOT EXISTS idx_checklist_results_kelas
  ON checklist_results (kelas);
CREATE INDEX IF NOT EXISTS idx_checklist_results_skor
  ON checklist_results (skor);
CREATE INDEX IF NOT EXISTS idx_checklist_results_created_at
  ON checklist_results (created_at DESC);

-- ============================================================
-- SUPABASE RLS
-- App memakai NEXT_PUBLIC_SUPABASE_ANON_KEY, jadi anon role perlu
-- izin insert dan select terbatas untuk kebutuhan submit/statistik.
-- ============================================================
ALTER TABLE checklist_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon insert checklist results" ON checklist_results;
CREATE POLICY "Allow anon insert checklist results"
  ON checklist_results
  FOR INSERT
  TO anon
  WITH CHECK (
    char_length(trim(nama)) >= 2
    AND skor >= 0
    AND skor <= 100
    AND jumlah_centang >= 0
    AND jumlah_centang <= total_item
    AND kategori IN ('Digital Guardian', 'Cukup Aman', 'Perlu Waspada')
  );

DROP POLICY IF EXISTS "Allow anon read checklist results" ON checklist_results;
CREATE POLICY "Allow anon read checklist results"
  ON checklist_results
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- VIEW 1: Daftar seluruh siswa yang mengisi
-- ============================================================
CREATE OR REPLACE VIEW view_daftar_siswa
WITH (security_invoker = true) AS
SELECT
  id,
  nama,
  kelas,
  skor,
  jumlah_centang,
  total_item,
  kategori,
  TO_CHAR(created_at AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY HH24:MI') AS waktu_isi
FROM checklist_results
ORDER BY created_at DESC;

-- ============================================================
-- VIEW 2: Rata-rata skor per kelas
-- ============================================================
CREATE OR REPLACE VIEW view_rata_kelas
WITH (security_invoker = true) AS
SELECT
  kelas,
  COUNT(*)::INT                                                AS jumlah_siswa,
  ROUND(AVG(skor)::NUMERIC, 1)::DOUBLE PRECISION               AS rata_skor,
  MAX(skor)                                                    AS skor_tertinggi,
  MIN(skor)                                                    AS skor_terendah,
  COUNT(*) FILTER (WHERE kategori = 'Digital Guardian')::INT   AS jumlah_guardian,
  COUNT(*) FILTER (WHERE kategori = 'Cukup Aman')::INT         AS jumlah_cukup_aman,
  COUNT(*) FILTER (WHERE kategori = 'Perlu Waspada')::INT      AS jumlah_perlu_waspada,
  MAX(created_at)                                              AS terakhir_submit
FROM checklist_results
GROUP BY kelas
ORDER BY rata_skor DESC;

-- ============================================================
-- VIEW 3: Statistik global keseluruhan
-- ============================================================
CREATE OR REPLACE VIEW view_statistik_global
WITH (security_invoker = true) AS
SELECT
  COUNT(*)::INT                                                AS total_submit,
  COALESCE(ROUND(AVG(skor)::NUMERIC, 1), 0)::DOUBLE PRECISION  AS rata_skor_global,
  COALESCE(MAX(skor), 0)                                       AS skor_tertinggi,
  COALESCE(MIN(skor), 0)                                       AS skor_terendah,
  COUNT(*) FILTER (WHERE kategori = 'Digital Guardian')::INT   AS jumlah_guardian,
  COUNT(*) FILTER (WHERE kategori = 'Cukup Aman')::INT         AS jumlah_cukup_aman,
  COUNT(*) FILTER (WHERE kategori = 'Perlu Waspada')::INT      AS jumlah_perlu_waspada,
  COUNT(DISTINCT kelas)::INT                                   AS jumlah_kelas,
  COUNT(DISTINCT nama)::INT                                    AS jumlah_siswa_unik
FROM checklist_results;

GRANT SELECT, INSERT ON checklist_results TO anon;
GRANT SELECT ON view_daftar_siswa TO anon;
GRANT SELECT ON view_rata_kelas TO anon;
GRANT SELECT ON view_statistik_global TO anon;
