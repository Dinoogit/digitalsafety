// pages/api/stats.js
// GET  /api/stats              — Statistik global + per kelas
// GET  /api/stats?kelas=XI.H   — Filter per kelas

import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabase) {
    return res.status(500).json({
      error: 'Konfigurasi Supabase belum lengkap. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.',
    });
  }

  try {
    const { kelas } = req.query;

    const { data: globalRow, error: globalError } = await supabase
      .from('view_statistik_global')
      .select('*')
      .maybeSingle();

    if (globalError) throw globalError;

    const { data: kelasList, error: kelasError } = await supabase
      .from('view_rata_kelas')
      .select('*')
      .order('rata_skor', { ascending: false })
      .limit(20);

    if (kelasError) throw kelasError;

    // Riwayat terbaru (10 terakhir), filter kelas jika ada
    let recentQuery = supabase
      .from('checklist_results')
      .select('id, nama, kelas, skor, kategori, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (kelas && kelas.trim()) {
      recentQuery = recentQuery.eq('kelas', kelas.trim());
    }

    const { data: recentRows, error: recentError } = await recentQuery;

    if (recentError) throw recentError;

    return res.status(200).json({
      global:  globalRow  || {},
      kelas:   kelasList  || [],
      recent:  recentRows || [],
    });
  } catch (err) {
    console.error('[/api/stats] error:', err);
    return res.status(500).json({ error: 'Gagal mengambil statistik.' });
  }
}
