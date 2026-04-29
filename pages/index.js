// pages/index.js
// Halaman utama Digital Safety Checklist
// Menggabungkan tampilan asli + koneksi ke backend API

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { CHECKLIST_SECTIONS, TOTAL_ITEMS, hitungKategori } from '../lib/checklistData';

const INSTAGRAM_USERNAMES = [
  'reikent_',
  'moses.jwt',
  'aiqaio',
  'gerrvaan_',
  'safarzazl_',
  'ipd.kha',
  'inirak.aa',
  'wndamlyaf_',
  'yeshuamatthew7',
];

async function readJsonResponse(res) {
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return res.json();
  }

  const text = await res.text();
  throw new Error(
    text.startsWith('<!DOCTYPE')
      ? 'Server mengembalikan halaman error, bukan JSON. Cek konfigurasi API/Supabase.'
      : text || 'Server mengembalikan respons yang tidak valid.'
  );
}

export default function Home() {
  const [theme, setTheme]           = useState('light');
  const [mounted, setMounted]       = useState(false);
  const [nama, setNama]             = useState('');
  const [kelas, setKelas]           = useState('');
  const [checked, setChecked]       = useState(() => new Array(TOTAL_ITEMS).fill(false));
  const [result, setResult]         = useState(null);   // { skor, kategori, nama, ... }
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [stats, setStats]           = useState(null);
  const [showStats, setShowStats]   = useState(false);
  const resultRef = useRef(null);

  // Tema dibaca setelah hydration agar render server dan client tetap sama.
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // Terapkan tema ke <html>
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Hitung statistik live
  const jumlahCentang = checked.filter(Boolean).length;
  const pct = Math.round((jumlahCentang / TOTAL_ITEMS) * 100);

  function toggleItem(idx) {
    setChecked(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  }

  async function hitungSkor() {
    if (!nama.trim()) {
      setError('Isi nama kamu dulu ya! 😊');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const checkedItems = checked
        .map((v, i) => v ? i : -1)
        .filter(i => i >= 0);

      const res = await fetch('/api/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nama: nama.trim(), kelas, checkedItems }),
      });

      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      setResult(data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      setError('Gagal menyimpan ke server: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res  = await fetch('/api/stats');
      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Gagal memuat statistik');
      setStats(data);
      setShowStats(true);
    } catch (err) {
      setError(err.message || 'Gagal memuat statistik.');
    }
  }

  function resetForm() {
    setResult(null);
    setNama('');
    setKelas('');
    setChecked(new Array(TOTAL_ITEMS).fill(false));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const kategori      = hitungKategori(pct);
  const resColor      = pct >= 85 ? 'rc-great' : pct >= 60 ? 'rc-ok' : 'rc-bad';
  const resEmo        = pct >= 85 ? '🏆' : pct >= 60 ? '👍' : '⚠️';
  const resTitle      = result
    ? (result.kategori === 'Digital Guardian'
        ? `${result.nama}${result.kelas ? ' (Kelas '+result.kelas+')' : ''}, Kamu Digital Guardian!`
        : result.kategori === 'Cukup Aman'
        ? `${result.nama}${result.kelas ? ' (Kelas '+result.kelas+')' : ''}, Kamu Cukup Aman!`
        : `${result.nama}${result.kelas ? ' (Kelas '+result.kelas+')' : ''}, Kamu Perlu Waspada!`)
    : '';
  const resDesc = result?.kategori === 'Digital Guardian'
    ? 'Luar biasa! Kamu sudah menerapkan hampir semua praktik keamanan digital. Terus pertahankan dan ajak teman-temanmu!'
    : result?.kategori === 'Cukup Aman'
    ? 'Bagus! Kamu sudah tahu dasar-dasar keamanan digital. Masih ada beberapa hal yang perlu diperbaiki — yuk tingkatkan lagi!'
    : 'Keamanan digitalmu masih perlu banyak ditingkatkan. Mulai dari yang paling dasar dulu — aktifkan 2FA dan gunakan password yang kuat!';

  return (
    <>
      <Head>
        <title>Digital Safety Checklist — SMAN 1 Tambun Selatan</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
      </Head>


      {/* HEADER */}
      <header className="hdr">
        <div className="hdr-in">
          <div className="hdr-logo">
            <img src="/logo.png" alt="Logo SMAN 1 Tambun Selatan" />
          </div>
          <div className="hdr-school">
            <h1>SMAN 1 Tambun Selatan</h1>
            <p>Kabupaten Bekasi · Jawa Barat</p>
          </div>
          <div className="hdr-right">
            <span className="hdr-badge">Digital Safety</span>
            <button
              className="toggle"
              onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
              title="Ganti tema"
            >
              <i
                className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}
                suppressHydrationWarning
              ></i>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-in">
          <div className="hero-logo">
            <img src="/logo.png" alt="Logo SMAN 1 Tambun Selatan" />
          </div>
          <div>
            <div className="hero-tag">
              <span className="hero-tag-dot"></span>
              Program Literasi Digital
              <span className="hero-tag-dot"></span>
            </div>
            <h2>Digital Safety<br />Checklist 2025</h2>
            <p>Isi checklist ini untuk mengukur kebiasaan digitalmu dan dapatkan skor keamanan pribadimu.</p>
          </div>
        </div>
      </section>

      <main className="main">

        {/* INFO */}
        <div className="info">
          <h4>ℹ️ Cara Mengisi</h4>
          <p>Centang item yang <strong>sudah kamu lakukan</strong> secara rutin. Jujur ya — hasilnya hanya untuk kamu dan sekolah. Data disimpan secara anonim untuk statistik.</p>
        </div>

        {/* FORM IDENTITAS */}
        <div className="card">
          <div className="section-title">👤 Identitas Kamu</div>
          <div className="section-sub">Digunakan untuk menampilkan hasil personalmu</div>
          <div className="ipt-row">
            <div>
              <label className="ipt-label" htmlFor="namaSiswa">Nama Lengkap</label>
              <input
                id="namaSiswa"
                className="ipt"
                type="text"
                placeholder="Nama lengkap kamu…"
                value={nama}
                onChange={e => setNama(e.target.value)}
              />
            </div>
            <div>
              <label className="ipt-label" htmlFor="kelasSiswa">Kelas</label>
              <input
                id="kelasSiswa"
                className="ipt"
                type="text"
                placeholder="Contoh: XI.H…"
                value={kelas}
                onChange={e => setKelas(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* CHECKLIST */}
        <div className="card">
          {CHECKLIST_SECTIONS.map(section => (
            <div key={section.id}>
              <div className="sec-lbl">{section.label}</div>
              {section.items.map(item => (
                <div
                  key={item.id}
                  className={`ci${checked[item.id] ? ' on' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <input type="checkbox" className="custom-cb" readOnly checked={checked[item.id]} />
                  <div className="cbx"><i className="fas fa-check"></i></div>
                  <div className="ci-body">
                    <div className="ci-txt">{item.txt}</div>
                    <div className="ci-note">{item.note}</div>
                    <div className="ci-foot">
                      <span className={`tag ${item.tagClass}`}>{item.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* PROGRESS */}
          <div className="prog-wrap">
            <div className="prog-head">
              <span className="prog-lbl">Skor Keamanan</span>
              <span className="prog-pct">{pct}%</span>
            </div>
            <div className="prog-bar">
              <progress className="prog-fill" value={pct} max="100" aria-label="Skor keamanan"></progress>
            </div>
            <span className="sl">{jumlahCentang} dari {TOTAL_ITEMS} item dicentang</span>
          </div>

          {error && <div className="err"><i className="fas fa-circle-exclamation err-icon"></i>{error}</div>}

          <button className="btn-main" onClick={hitungSkor} disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin"></i> Menyimpan…</>
              : <><i className="fas fa-shield-halved"></i> Lihat Hasil & Simpan</>
            }
          </button>
          <button className="btn-ghost" onClick={resetForm}>
            <i className="fas fa-rotate-left"></i> Reset
          </button>
        </div>

        {/* RESULT */}
        {result && (
          <div id="result" ref={resultRef}>
            <div className={`res-card ${resColor}`}>
              <div className="res-emo">{resEmo}</div>
              <div className="res-skor">{result.skor}%</div>
              <div className="res-ttl">{resTitle}</div>
              <div className="res-desc">{resDesc}</div>
            </div>
            <button className="btn-ghost" onClick={resetForm}>
              <i className="fas fa-rotate-left"></i> Isi Ulang Checklist
            </button>
          </div>
        )}

        {/* STATISTIK */}
        <div className="card card-spaced">
          <div className="section-title">📊 Statistik Kelas</div>
          <div className="section-sub">Lihat rata-rata skor semua siswa yang sudah mengisi</div>
          <button className="btn-stats" onClick={loadStats}>
            <i className="fas fa-chart-bar"></i> Tampilkan Statistik
          </button>

          {showStats && stats && (
            <div className="stats-panel">
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-num">{stats.global?.total_submit ?? 0}</div>
                  <div className="stat-lbl">Total Siswa</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{stats.global?.rata_skor_global ?? 0}%</div>
                  <div className="stat-lbl">Rata-rata Skor</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{stats.global?.jumlah_kelas ?? 0}</div>
                  <div className="stat-lbl">Kelas</div>
                </div>
              </div>

              {stats.kelas?.length > 0 && (
                <div className="kelas-list">
                  <div className="stats-subtitle">
                    Rata-rata per Kelas
                  </div>
                  {stats.kelas.map((k, i) => (
                    <div className="kelas-row" key={i}>
                      <span className="kelas-name">{k.kelas || '(tidak diisi)'}</span>
                      <span className="kelas-count">{k.jumlah_siswa} siswa</span>
                      <span className="kelas-skor">{k.rata_skor}%</span>
                    </div>
                  ))}
                </div>
              )}

              {stats.recent?.length > 0 && (
                <div className="recent-list">
                  <div className="stats-subtitle">
                    10 Pengisian Terbaru
                  </div>
                  {stats.recent.map(r => (
                    <div className="kelas-row" key={r.id}>
                      <span className="kelas-name">{r.nama}</span>
                      <span className="kelas-meta">{r.kelas}</span>
                      <span className="kelas-skor">{r.skor}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="ftr">
        <div className="ftr-in">
          <p className="ftr-copy">
            © 2025 SMAN 1 Tambun Selatan · Kabupaten Bekasi · Jawa Barat<br />
            Program Literasi Digital — Keamanan di Dunia Maya Dimulai dari Kamu
          </p>
          <div className="ftr-ig-list" aria-label="Instagram tim">
            {INSTAGRAM_USERNAMES.map(username => (
              <a
                key={username}
                href={`https://www.instagram.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ftr-ig-link"
              >
                <i className="fab fa-instagram"></i>
                @{username}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

