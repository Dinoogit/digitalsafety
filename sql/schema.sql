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
  CONSTRAINT checklist_results_nama_not_blank
    CHECK (char_length(trim(nama)) >= 2),
  CONSTRAINT checklist_results_kelas_not_blank
    CHECK (char_length(trim(kelas)) >= 1),
  CONSTRAINT checklist_results_skor_range
    CHECK (skor >= 0 AND skor <= 100),
  CONSTRAINT checklist_results_jumlah_centang_range
    CHECK (jumlah_centang >= 0 AND jumlah_centang <= total_item),
  CONSTRAINT checklist_results_total_item_positive
    CHECK (total_item > 0),
  CONSTRAINT checklist_results_kategori_check
    CHECK (kategori IN ('Digital Guardian', 'Cukup Aman', 'Perlu Waspada'))
);

-- Jika tabel sudah pernah dibuat sebelumnya, CREATE TABLE IF NOT EXISTS
-- tidak akan menambah kolom yang belum ada. Blok ini membuat schema aman
-- dijalankan ulang di Supabase SQL Editor.
ALTER TABLE checklist_results
  ADD COLUMN IF NOT EXISTS nama VARCHAR(100);

ALTER TABLE checklist_results
  ADD COLUMN IF NOT EXISTS kelas VARCHAR(20);

ALTER TABLE checklist_results
  ADD COLUMN IF NOT EXISTS skor SMALLINT DEFAULT 0;

ALTER TABLE checklist_results
  ADD COLUMN IF NOT EXISTS jumlah_centang SMALLINT DEFAULT 0;

ALTER TABLE checklist_results
  ADD COLUMN IF NOT EXISTS total_item SMALLINT DEFAULT 15;

ALTER TABLE checklist_results
  ADD COLUMN IF NOT EXISTS checked_items JSONB DEFAULT '[]'::jsonb;

ALTER TABLE checklist_results
  ADD COLUMN IF NOT EXISTS kategori VARCHAR(32) DEFAULT 'Perlu Waspada';

ALTER TABLE checklist_results
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

UPDATE checklist_results
SET
  nama = COALESCE(NULLIF(trim(nama), ''), 'Tanpa Nama'),
  kelas = COALESCE(NULLIF(trim(kelas), ''), 'Tidak Diisi'),
  skor = COALESCE(skor, 0),
  jumlah_centang = COALESCE(jumlah_centang, 0),
  total_item = COALESCE(total_item, 15),
  checked_items = COALESCE(checked_items, '[]'::jsonb),
  kategori = COALESCE(kategori, 'Perlu Waspada'),
  created_at = COALESCE(created_at, NOW());

ALTER TABLE checklist_results
  ALTER COLUMN nama SET NOT NULL,
  ALTER COLUMN kelas SET NOT NULL,
  ALTER COLUMN skor SET NOT NULL,
  ALTER COLUMN jumlah_centang SET NOT NULL,
  ALTER COLUMN total_item SET NOT NULL,
  ALTER COLUMN checked_items SET NOT NULL,
  ALTER COLUMN kategori SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE checklist_results
  ALTER COLUMN skor SET DEFAULT 0,
  ALTER COLUMN jumlah_centang SET DEFAULT 0,
  ALTER COLUMN total_item SET DEFAULT 15,
  ALTER COLUMN checked_items SET DEFAULT '[]'::jsonb,
  ALTER COLUMN kategori SET DEFAULT 'Perlu Waspada',
  ALTER COLUMN created_at SET DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'checklist_results_nama_not_blank'
  ) THEN
    ALTER TABLE checklist_results
      ADD CONSTRAINT checklist_results_nama_not_blank
      CHECK (char_length(trim(nama)) >= 2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'checklist_results_kelas_not_blank'
  ) THEN
    ALTER TABLE checklist_results
      ADD CONSTRAINT checklist_results_kelas_not_blank
      CHECK (char_length(trim(kelas)) >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'checklist_results_skor_range'
  ) THEN
    ALTER TABLE checklist_results
      ADD CONSTRAINT checklist_results_skor_range
      CHECK (skor >= 0 AND skor <= 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'checklist_results_jumlah_centang_range'
  ) THEN
    ALTER TABLE checklist_results
      ADD CONSTRAINT checklist_results_jumlah_centang_range
      CHECK (jumlah_centang >= 0 AND jumlah_centang <= total_item);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'checklist_results_total_item_positive'
  ) THEN
    ALTER TABLE checklist_results
      ADD CONSTRAINT checklist_results_total_item_positive
      CHECK (total_item > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'checklist_results_kategori_check'
  ) THEN
    ALTER TABLE checklist_results
      ADD CONSTRAINT checklist_results_kategori_check
      CHECK (kategori IN ('Digital Guardian', 'Cukup Aman', 'Perlu Waspada'));
  END IF;
END $$;

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
    AND char_length(trim(kelas)) >= 1
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
DROP VIEW IF EXISTS view_daftar_siswa;

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
DROP VIEW IF EXISTS view_rata_kelas;

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
DROP VIEW IF EXISTS view_statistik_global;

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
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relkind = 'S'
      AND relname = 'checklist_results_id_seq'
  ) THEN
    GRANT USAGE, SELECT ON SEQUENCE checklist_results_id_seq TO anon;
  END IF;
END $$;
GRANT SELECT ON view_daftar_siswa TO anon;
GRANT SELECT ON view_rata_kelas TO anon;
GRANT SELECT ON view_statistik_global TO anon;
