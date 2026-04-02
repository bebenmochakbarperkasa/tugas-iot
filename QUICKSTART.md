# 🚀 Quick Start Guide

Panduan cepat untuk menjalankan IoT Dashboard dalam 3 langkah mudah.

## Langkah 1: Install Dependencies

```bash
npm install
```

## Langkah 2: Jalankan Dashboard

Buka terminal pertama dan jalankan:

```bash
npm run dev
```

Dashboard akan tersedia di: **http://localhost:3000**

## Langkah 3: Jalankan MQTT Subscriber

Buka terminal kedua dan jalankan:

```bash
npm run mqtt
```

MQTT subscriber akan mulai mendengarkan data dari broker.

## 🧪 Testing dengan Data Simulasi

Untuk mengirim data test secara otomatis, buka terminal ketiga dan jalankan:

```bash
node test-mqtt.js
```

Script ini akan mengirim data sensor random setiap 5 detik:
- Suhu: 20-35°C
- Kelembaban: 40-80%
- Tekanan: 1000-1030 hPa

## 📊 Melihat Dashboard

1. Buka browser ke **http://localhost:3000**
2. Anda akan melihat:
   - **Cards** menampilkan nilai sensor terbaru
   - **Grafik** menampilkan data historis
   - Data akan update otomatis setiap beberapa detik

## 🛑 Menghentikan Aplikasi

Tekan `Ctrl+C` di setiap terminal untuk menghentikan:
- Dashboard (terminal 1)
- MQTT Subscriber (terminal 2)
- Test Publisher (terminal 3)

## 📝 Catatan

- Database SQLite (`iot-data.db`) akan dibuat otomatis
- Tidak perlu konfigurasi tambahan untuk testing
- Broker MQTT default: `broker.hivemq.com` (public broker)

## 🔧 Troubleshooting

**Dashboard tidak menampilkan data?**
- Pastikan MQTT subscriber berjalan (`npm run mqtt`)
- Jalankan test publisher (`node test-mqtt.js`)
- Tunggu beberapa detik untuk data muncul

**Error saat install?**
- Pastikan Node.js versi 18+ terinstall
- Hapus folder `node_modules` dan `package-lock.json`, lalu install ulang

## 📚 Dokumentasi Lengkap

Lihat [README.md](./README.md) untuk dokumentasi lengkap dan advanced configuration.
