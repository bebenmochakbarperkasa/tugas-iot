# IoT Dashboard - Real-time Sensor Monitoring

Dashboard IoT berbasis web yang menampilkan data sensor secara real-time menggunakan Next.js, SQLite, dan MQTT.

## 🚀 Fitur Utama

- **Real-time Monitoring**: Data sensor diperbarui otomatis tanpa refresh halaman
- **Multiple Sensors**: Mendukung berbagai jenis sensor (suhu, kelembaban, tekanan, dll)
- **Data Visualization**: 
  - Card untuk menampilkan nilai terbaru
  - Grafik interaktif untuk data historis
- **Database Storage**: Menyimpan semua data sensor ke SQLite
- **MQTT Integration**: Menerima data dari broker MQTT secara real-time

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
│   │   └── sensor-data/
│   │       ├── route.ts           # POST endpoint untuk menyimpan data
│   │       ├── latest/
│   │       │   └── route.ts       # GET data terbaru semua sensor
│   │       └── history/
│   │           └── route.ts       # GET data historis per sensor
│   ├── components/
│   │   ├── SensorCard.tsx         # Komponen card sensor
│   │   └── SensorChart.tsx        # Komponen grafik sensor
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Dashboard utama
│   └── globals.css                # Global styles
├── lib/
│   └── db.ts                      # Database utilities & schema
├── mqtt-subscriber.js             # MQTT subscriber service
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── iot-data.db                    # SQLite database (auto-generated)
```

## 🔧 Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Dashboard akan berjalan di `http://localhost:3000`

### 3. Jalankan MQTT Subscriber

Di terminal terpisah, jalankan:

```bash
npm run mqtt
```

MQTT subscriber akan:
- Connect ke broker MQTT (default: broker.hivemq.com)
- Subscribe ke topic: `sensor/suhu`, `sensor/kelembaban`, `sensor/tekanan`
- Menyimpan data yang diterima ke database SQLite

## 📡 MQTT Configuration

### Default Topics

- `sensor/suhu` - Data suhu
- `sensor/kelembaban` - Data kelembaban
- `sensor/tekanan` - Data tekanan

### Format Payload (JSON)

```json
{
  "value": 25.5,
  "unit": "°C"
}
```

Atau format alternatif:

```json
{
  "temperature": 25.5,
  "humidity": 60,
  "pressure": 1013
}
```

### Mengirim Data Test ke MQTT

Anda bisa menggunakan MQTT client seperti MQTT Explorer atau mosquitto_pub:

```bash
# Install mosquitto-clients
sudo apt-get install mosquitto-clients

# Kirim data suhu
mosquitto_pub -h broker.hivemq.com -t sensor/suhu -m '{"value": 25.5, "unit": "°C"}'

# Kirim data kelembaban
mosquitto_pub -h broker.hivemq.com -t sensor/kelembaban -m '{"value": 65, "unit": "%"}'

# Kirim data tekanan
mosquitto_pub -h broker.hivemq.com -t sensor/tekanan -m '{"value": 1013, "unit": "hPa"}'
```

### Menggunakan MQTT Explorer (GUI)

1. Download MQTT Explorer: http://mqtt-explorer.com/
2. Connect ke `broker.hivemq.com`
3. Publish message ke topic yang diinginkan dengan payload JSON

## 🗄️ Database Schema

```sql
CREATE TABLE sensor_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sensor_type TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 API Endpoints

### POST /api/sensor-data
Menyimpan data sensor baru

**Request Body:**
```json
{
  "sensor_type": "suhu",
  "value": 25.5,
  "unit": "°C"
}
```

### GET /api/sensor-data/latest
Mendapatkan data terbaru dari semua sensor

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "sensor_type": "suhu",
      "value": 25.5,
      "unit": "°C",
      "timestamp": "2024-01-01 12:00:00"
    }
  ]
}
```

### GET /api/sensor-data/history?sensor_type=suhu&limit=50
Mendapatkan data historis sensor tertentu

**Query Parameters:**
- `sensor_type` (required): Tipe sensor
- `limit` (optional): Jumlah data (default: 50)

## 🎨 UI Features

### Dashboard Components

1. **Header**
   - Judul aplikasi
   - Status koneksi real-time

2. **Sensor Cards**
   - Menampilkan nilai terbaru setiap sensor
   - Icon dan warna berbeda per sensor
   - Indikator "Live" dengan animasi

3. **Charts**
   - Grafik line interaktif
   - Menampilkan 20 data terakhir
   - Auto-update setiap 5 detik

### Auto-Update Mechanism

- **Latest Data**: Polling setiap 3 detik
- **Historical Data**: Polling setiap 5 detik
- Tidak perlu refresh halaman manual

## 🔄 Menambah Sensor Baru

### 1. Update MQTT Subscriber

Edit `mqtt-subscriber.js`:

```javascript
const TOPICS = [
  'sensor/suhu',
  'sensor/kelembaban',
  'sensor/tekanan',
  'sensor/cahaya',  // Sensor baru
];
```

### 2. Update Dashboard Config (Optional)

Edit `app/page.tsx` untuk menambah icon dan warna:

```typescript
const getSensorConfig = (type: string) => {
  const configs: { [key: string]: { icon: string; color: string } } = {
    suhu: { icon: '🌡️', color: 'text-red-500' },
    kelembaban: { icon: '💧', color: 'text-blue-500' },
    tekanan: { icon: '📊', color: 'text-purple-500' },
    cahaya: { icon: '💡', color: 'text-yellow-500' },  // Sensor baru
  };
  return configs[type] || { icon: '📡', color: 'text-gray-500' };
};
```

## 🚀 Production Deployment

### Build untuk Production

```bash
npm run build
npm start
```

### Environment Variables (Optional)

Buat file `.env.local`:

```env
MQTT_BROKER=mqtt://broker.hivemq.com
DATABASE_PATH=./iot-data.db
```

## 🐛 Troubleshooting

### MQTT Subscriber tidak menerima data

1. Pastikan broker MQTT dapat diakses
2. Cek koneksi internet
3. Verifikasi topic name sudah benar
4. Cek format payload JSON

### Dashboard tidak menampilkan data

1. Pastikan MQTT subscriber sedang berjalan (`npm run mqtt`)
2. Cek database `iot-data.db` sudah terbuat
3. Kirim test data ke MQTT broker
4. Buka browser console untuk error messages

### Database error

1. Hapus file `iot-data.db` dan restart aplikasi
2. Database akan dibuat ulang otomatis

## 📝 Testing

### Simulasi Data Sensor dengan Script

Buat file `test-mqtt.js`:

```javascript
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  setInterval(() => {
    const suhu = (20 + Math.random() * 15).toFixed(1);
    const kelembaban = (40 + Math.random() * 40).toFixed(1);
    const tekanan = (1000 + Math.random() * 30).toFixed(1);
    
    client.publish('sensor/suhu', JSON.stringify({ value: parseFloat(suhu), unit: '°C' }));
    client.publish('sensor/kelembaban', JSON.stringify({ value: parseFloat(kelembaban), unit: '%' }));
    client.publish('sensor/tekanan', JSON.stringify({ value: parseFloat(tekanan), unit: 'hPa' }));
    
    console.log(`Published - Suhu: ${suhu}°C, Kelembaban: ${kelembaban}%, Tekanan: ${tekanan}hPa`);
  }, 5000);
});
```

Jalankan:
```bash
node test-mqtt.js
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [Better SQLite3 Documentation](https://github.com/WiseLibs/better-sqlite3)

## 📄 License

MIT License - Silakan digunakan untuk keperluan apapun.

## 👨‍💻 Author

IoT Dashboard Application - 2024
