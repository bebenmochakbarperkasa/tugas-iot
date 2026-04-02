import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'iot-data.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sensor_type ON sensor_data(sensor_type);
  CREATE INDEX IF NOT EXISTS idx_timestamp ON sensor_data(timestamp);
`);

export interface SensorData {
  id?: number;
  sensor_type: string;
  value: number;
  unit?: string;
  timestamp?: string;
}

export function insertSensorData(data: SensorData) {
  const stmt = db.prepare(`
    INSERT INTO sensor_data (sensor_type, value, unit)
    VALUES (?, ?, ?)
  `);
  return stmt.run(data.sensor_type, data.value, data.unit || '');
}

export function getLatestData(sensorType: string) {
  const stmt = db.prepare(`
    SELECT * FROM sensor_data
    WHERE sensor_type = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `);
  return stmt.get(sensorType);
}

export function getHistoricalData(sensorType: string, limit: number = 50) {
  const stmt = db.prepare(`
    SELECT * FROM sensor_data
    WHERE sensor_type = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `);
  return stmt.all(sensorType, limit);
}

export function getAllLatestData() {
  const stmt = db.prepare(`
    SELECT DISTINCT sensor_type FROM sensor_data
  `);
  const sensorTypes = stmt.all() as { sensor_type: string }[];
  
  return sensorTypes.map(({ sensor_type }) => getLatestData(sensor_type));
}

export default db;
