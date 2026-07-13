# Frontend PA YouTube Agriculture

Antarmuka web untuk aplikasi **PA YouTube Agriculture**, sebuah proyek yang membantu pengguna mengakses dan mengolah informasi terkait konten YouTube bertema pertanian.

## Teknologi

Frontend ini dibangun menggunakan ekosistem JavaScript modern. Detail dependensi dan skrip yang tersedia dapat dilihat pada berkas `package.json`.

## Prasyarat

Pastikan perangkat telah memiliki:

- [Node.js](https://nodejs.org/) versi LTS
- npm (terpasang bersama Node.js)

## Instalasi

Jalankan perintah berikut dari folder `frontend`:

```bash
npm install
```

## Menjalankan aplikasi

Untuk menjalankan server pengembangan, gunakan:

```bash
npm run dev
```

Buka alamat yang ditampilkan di terminal (umumnya `http://localhost:5173`) melalui browser.

## Build produksi

Untuk membuat berkas siap deploy:

```bash
npm run build
```

Hasil build akan dibuat pada folder output yang dikonfigurasi oleh proyek.

## Struktur proyek

```text
frontend/
├── public/          # Aset statis
├── src/             # Komponen, halaman, dan logika aplikasi
├── package.json      # Dependensi dan skrip proyek
└── README.md         # Dokumentasi frontend
```

## Konfigurasi backend

Pastikan layanan backend proyek dijalankan sebelum menggunakan fitur yang membutuhkan data dari server. Bila alamat API dapat dikonfigurasi, sesuaikan URL backend pada konfigurasi frontend sesuai lingkungan yang digunakan.

## Troubleshooting

- Jika `npm install` gagal, pastikan Node.js menggunakan versi LTS terbaru.
- Jika aplikasi tidak dapat mengambil data, periksa bahwa backend aktif dan alamat API sudah benar.
- Jika port server sudah digunakan, jalankan aplikasi pada port lain sesuai opsi yang didukung skrip pengembangan proyek.

## Lisensi

Proyek ini dibuat untuk keperluan tugas akhir.
