# IoT Dashboard - Real-time Sensor Monitoring

Dashboard IoT berbasis web yang menampilkan data sensor secara real-time menggunakan Next.js, SQLite, dan MQTT dengan koneksi ke HiveMQ Cloud broker.

## 🚀 Fitur Utama

- **Real-time Monitoring**: Data sensor diperbarui otomatis setiap 3 detik tanpa refresh halaman
- **Multiple Sensors**: Mendukung berbagai jenis sensor (suhu, kelembaban, gerakan, dll)
- **Settings Page**: Halaman pengaturan untuk menambah, mengedit, dan menghapus sensor secara dinamis
- **Flexible Data Format**: Mendukung format JSON (`{"value": 29.7}`) dan plain text (`29.7`, `ON`, `OFF`)
- **ON/OFF Support**: Sensor gerakan/motion menampilkan status ON/OFF pada dashboard
- **Custom Colors**: Warna card sensor dapat dikustomisasi melalui halaman settings
- **Responsive Grid**: Layout 4 card per baris yang responsif
- **Data Visualization**:
  - Card untuk menampilkan nilai terbaru
  - Grafik interaktif untuk data historis
- **Database Storage**: Menyimpan semua data sensor dan konfigurasi ke SQLite
- **MQTT Integration**: Menerima data dari HiveMQ Cloud broker dengan TLS/SSL

## 📋 Teknologi yang Digunakan

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: SQLite dengan better-sqlite3
- **MQTT Client**: mqtt.js
- **Charts**: Chart.js & react-chartjs-2
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📁 Struktur Project

```
iot/
├── app/
│   ├── api/
│   │   ├── sensor-data/
│   │   │   ├── route.ts           # POST endpoint untuk menyimpan data
│   │   │   ├── latest/
│   │   │   │   └── route.ts       # GET data terbaru semua sensor
│   │   │   └── history/
│   │   │       └── route.ts       # GET data historis per sensor
│   │   ├── sensors/
│   │   │   └── route.ts           # CRUD endpoint untuk sensor config
│   │   └── broker-config/
│   │       └── route.ts           # CRUD endpoint untuk broker config
│   ├── components/
│   │   ├── SensorCard.tsx         # Komponen card sensor (dengan ON/OFF support)
│   │   └── SensorChart.tsx        # Komponen grafik sensor
│   ├── settings/
│   │   └── page.tsx               # Halaman pengaturan sensor & broker
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Dashboard utama
│   └── globals.css                # Global styles
├── lib/
│   ├── db.ts                      # Database utilities & schema
│   └── config.ts                  # Konfigurasi aplikasi
├── mqtt-subscriber.js             # MQTT subscriber service
├── test-mqtt.js                   # Script simulasi data sensor
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── iot-data.db                    # SQLite database (auto-generated)
```

## 🔧 Instalasi & Menjalankan

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Dashboard akan berjalan di `http://localhost:3312`

### 3. Jalankan MQTT Subscriber

Di terminal terpisah, jalankan:

```bash
npm run mqtt
```

MQTT subscriber akan:
- Connect ke HiveMQ Cloud broker dengan TLS (port 8883)
- Subscribe ke topic yang dikonfigurasi di database
- Menyimpan data yang diterima ke database SQLite
- Mendukung format data JSON dan plain text

### 4. (Opsional) Jalankan Test Publisher

Di terminal terpisah, untuk simulasi data sensor:

```bash
node test-mqtt.js
```

## 📡 MQTT Configuration

### Broker

- **URL**: `mqtts://729ed9997932469090ce4f1d9eeff994.s1.eu.hivemq.cloud`
- **Port**: `8883` (TLS/SSL)
- **Username**: `test-iot`
- **Password**: `Test12345`
- **Protocol**: `mqtts` (MQTT over TLS)

### Topics (Dikonfigurasi via Settings Page)

Topics sensor dikelola melalui halaman `/settings`. Contoh default:

- `rumah/sensor/suhu` - Data suhu
- `rumah/sensor/kelembapan` - Data kelembaban
- `rumah/sensor/gerak` - Data gerakan (ON/OFF)

### Format Payload yang Didukung

**1. Plain Text (angka)**
```
29.7
```

**2. Plain Text (status)**
```
ON
OFF
```

**3. JSON Object**
```json
{
  "value": 25.5,
  "unit": "°C"
}
```

**4. JSON Alternatif**
```json
{
  "temperature": 25.5,
  "humidity": 60,
  "pressure": 1013
}
```

## ⚙️ Settings Page (`/settings`)

Halaman pengaturan untuk mengelola sensor dan broker MQTT.

### Fitur Settings

- **Tambah Sensor Baru**: Tambahkan sensor dengan konfigurasi topic, unit, icon, dan warna
- **Edit Sensor**: Ubah konfigurasi sensor yang sudah ada secara inline
- **Hapus Sensor**: Hapus sensor yang tidak digunakan
- **Color Picker**: Pilih warna card sensor menggunakan color picker
- **Broker Config**: Konfigurasi URL broker MQTT

### Kolom Konfigurasi Sensor

| Kolom | Deskripsi | Contoh |
|-------|-----------|--------|
| `sensor_type` | Tipe/ID sensor (unik) | `suhu` |
| `sensor_name` | Nama tampilan | `Suhu` |
| `topic` | MQTT topic | `rumah/sensor/suhu` |
| `unit` | Satuan pengukuran | `°C`, `%`, `-` |
| `icon` | Emoji icon | 🌡️, 💧, 🏃 |
| `color` | Warna card (hex/rgb) | `#ff0000` |
| `bg_gradient` | CSS gradient | `bg-gradient-to-br from-red-500...` |

## 🗄️ Database Schema

```sql
-- Data sensor
CREATE TABLE sensor_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Konfigurasi sensor
CREATE TABLE sensor_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_type TEXT UNIQUE NOT NULL,
  sensor_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  unit TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  bg_gradient TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Konfigurasi broker
CREATE TABLE broker_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  broker_url TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 API Endpoints

### Sensor Data

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/sensor-data` | Menyimpan data sensor baru |
| GET | `/api/sensor-data/latest` | Data terbaru semua sensor |
| GET | `/api/sensor-data/history?sensor_type=suhu&limit=50` | Data historis per sensor |

### Sensor Config

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/sensors` | Semua konfigurasi sensor |
| POST | `/api/sensors` | Tambah sensor baru |
| PUT | `/api/sensors` | Update sensor |
| DELETE | `/api/sensors?id=1` | Hapus sensor |

### Broker Config

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/broker-config` | Konfigurasi broker saat ini |
| PUT | `/api/broker-config` | Update konfigurasi broker |

## 🎨 UI Features

### Dashboard (`/`)

- **Sensor Cards**: Grid responsif 4 card per baris dengan warna kustom
- **ON/OFF Display**: Sensor gerakan menampilkan status ON/OFF
- **Live Indicator**: Animasi pulse hijau menandakan data live
- **Historical Charts**: Grafik line interaktif per sensor
- **Auto-Update**: Data diperbarui setiap 3 detik

### Settings (`/settings`)

- **Tabel Sensor**: Tampilan tabel dengan kolom lengkap
- **Inline Editing**: Edit langsung di tabel
- **Color Picker**: Input warna visual
- **Broker Config**: Pengaturan URL broker MQTT

## 🔄 Menambah Sensor Baru

Cukup buka halaman **Settings** (`/settings`):

1. Klik tombol **"Tambah Sensor Baru"**
2. Isi form: tipe sensor, nama, topic, unit, icon, warna
3. Klik **"Simpan"**
4. **Restart MQTT Subscriber** agar subscribe ke topic baru:
   ```bash
   # Stop subscriber (Ctrl+C)
   npm run mqtt
   ```

## 🚀 Production Deployment

### Build untuk Production

```bash
npm run build
npm start
```

Aplikasi akan berjalan di port `3312`.

## 🐛 Troubleshooting

### MQTT Subscriber tidak menerima data

1. Pastikan broker HiveMQ Cloud dapat diakses
2. Verifikasi credentials (username/password) benar
3. Cek topic di `/settings` sesuai dengan topic publisher
4. Pastikan format data sesuai (JSON atau plain text)
5. Cek log subscriber untuk pesan error

### Dashboard tidak menampilkan data terbaru

1. Pastikan MQTT subscriber sedang berjalan (`npm run mqtt`)
2. Cek log subscriber: harus ada `💾 Saved:` untuk setiap data yang masuk
3. Jika hanya `📨 Received` tanpa `💾 Saved`, format data tidak sesuai
4. Hard refresh browser: `Ctrl + Shift + R`
5. Pastikan sensor terdaftar di `/settings`

### Sensor muncul kembali setelah dihapus

- Pastikan menggunakan versi terbaru `mqtt-subscriber.js` yang tidak memiliki default sensor insertion

### Database locked error

1. Pastikan hanya satu instance subscriber yang berjalan
2. Stop subscriber dan dev server, lalu jalankan ulang

## 📝 Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan Next.js development server (port 3312) |
| `npm run build` | Build untuk production |
| `npm start` | Jalankan production server (port 3312) |
| `npm run mqtt` | Jalankan MQTT subscriber |
| `node test-mqtt.js` | Simulasi data sensor |

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Better SQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [HiveMQ Cloud](https://www.hivemq.com/cloud/)

## 📄 License

MIT License - Silakan digunakan untuk keperluan apapun.

## 👨‍💻 Author

IoT Dashboard Application - 2026
