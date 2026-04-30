// pages/api/submit.js
// POST  /api/submit  — Simpan hasil checklist ke database

import { supabase } from '../../lib/supabase';
import { TOTAL_ITEMS, hitungKategori } from '../../lib/checklistData';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return res.status(500).json({
      error: 'Konfigurasi Supabase belum lengkap. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.',
    });
  }

  try {
    const { nama, kelas, checkedItems } = req.body;

    // Validasi input
    if (!nama || typeof nama !== 'string' || nama.trim().length < 2) {
      return res.status(400).json({ error: 'Nama tidak valid (minimal 2 karakter)' });
    }
    if (!kelas || typeof kelas !== 'string' || kelas.trim().length < 1) {
      return res.status(400).json({ error: 'Kelas wajib diisi' });
    }
    if (!Array.isArray(checkedItems)) {
      return res.status(400).json({ error: 'checkedItems harus berupa array' });
    }

    const namaBersih  = nama.trim().substring(0, 100);
    const kelasBersih = kelas.trim().substring(0, 20);
    const checkedItemsValid = checkedItems
      .filter((i) => Number.isInteger(i) && i >= 0 && i < TOTAL_ITEMS);

    // Hitung skor
    const jumlahCentang = checkedItemsValid.length;

    const skor     = Number(Math.round((jumlahCentang / TOTAL_ITEMS) * 100));
    const kategori = hitungKategori(skor);
    const payload = {
      nama: namaBersih,
      kelas: kelasBersih,
      skor,
      jumlah_centang: jumlahCentang,
      total_item: TOTAL_ITEMS,
      checked_items: checkedItemsValid,
      kategori,
    };

    const { data: saved, error } = await supabase
      .from('checklist_results')
      .insert(payload)
      .select('id')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      id:       saved.id,
      nama:     namaBersih,
      kelas:    kelasBersih,
      skor,
      jumlahCentang,
      totalItem: TOTAL_ITEMS,
      kategori,
    });
  } catch (err) {
    console.error('[/api/submit] error:', err);
    return res.status(500).json({
      error: err.message || 'Gagal menyimpan data. Coba lagi.',
      detail: err.details || err.hint || err.code || null,
    });
  }
}
