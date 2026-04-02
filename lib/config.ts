import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'iot-data.db');

export interface SensorConfig {
  id?: number;
  sensor_type: string;
  sensor_name: string;
  topic: string;
  unit: string;
  icon: string;
  color: string;
  bg_gradient: string;
  updated_at?: string;
}

export interface BrokerConfig {
  id?: number;
  broker_url: string;
  updated_at?: string;
}

export function initConfigTable() {
  const db = new Database(dbPath);
  
  // Create sensor_config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sensor_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_type TEXT UNIQUE NOT NULL,
      sensor_name TEXT NOT NULL,
      topic TEXT NOT NULL,
      unit TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      bg_gradient TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create broker_config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS broker_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      broker_url TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Insert default sensors if not exists
  const defaults = [
    { 
      sensor_type: 'kelembaban', 
      sensor_name: 'Kelembaban',
      topic: 'sensor/kelembaban',
      unit: '%',
      icon: '💧',
      color: 'rgb(59, 130, 246)',
      bg_gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600'
    },
    { 
      sensor_type: 'suhu', 
      sensor_name: 'Suhu',
      topic: 'sensor/suhu',
      unit: '°C',
      icon: '🌡️',
      color: 'rgb(239, 68, 68)',
      bg_gradient: 'bg-gradient-to-br from-red-500 via-red-600 to-orange-600'
    },
    { 
      sensor_type: 'tekanan', 
      sensor_name: 'Tekanan',
      topic: 'sensor/tekanan',
      unit: 'hPa',
      icon: '📊',
      color: 'rgb(168, 85, 247)',
      bg_gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600'
    }
  ];
  
  const insert = db.prepare(`
    INSERT OR IGNORE INTO sensor_config (sensor_type, sensor_name, topic, unit, icon, color, bg_gradient) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (const config of defaults) {
    insert.run(
      config.sensor_type, 
      config.sensor_name,
      config.topic, 
      config.unit,
      config.icon,
      config.color,
      config.bg_gradient
    );
  }
  
  db.close();
}

export function getSensorConfigs(): SensorConfig[] {
  const db = new Database(dbPath);
  const configs = db.prepare('SELECT * FROM sensor_config ORDER BY sensor_type').all() as SensorConfig[];
  db.close();
  return configs;
}

export function getSensorConfig(sensor_type: string): SensorConfig | null {
  const db = new Database(dbPath);
  const config = db.prepare('SELECT * FROM sensor_config WHERE sensor_type = ?').get(sensor_type) as SensorConfig | undefined;
  db.close();
  return config || null;
}

export function updateSensorConfig(config: SensorConfig) {
  const db = new Database(dbPath);
  const stmt = db.prepare(`
    INSERT INTO sensor_config (sensor_type, sensor_name, topic, unit, icon, color, bg_gradient) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sensor_type) 
    DO UPDATE SET 
      sensor_name = ?,
      topic = ?, 
      unit = ?,
      icon = ?,
      color = ?,
      bg_gradient = ?,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(
    config.sensor_type,
    config.sensor_name,
    config.topic,
    config.unit,
    config.icon,
    config.color,
    config.bg_gradient,
    config.sensor_name,
    config.topic,
    config.unit,
    config.icon,
    config.color,
    config.bg_gradient
  );
  db.close();
}

export function addSensorConfig(config: Omit<SensorConfig, 'id' | 'updated_at'>) {
  const db = new Database(dbPath);
  const stmt = db.prepare(`
    INSERT INTO sensor_config (sensor_type, sensor_name, topic, unit, icon, color, bg_gradient) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    config.sensor_type,
    config.sensor_name,
    config.topic,
    config.unit,
    config.icon,
    config.color,
    config.bg_gradient
  );
  db.close();
}

export function deleteSensorConfig(sensor_type: string) {
  const db = new Database(dbPath);
  db.prepare('DELETE FROM sensor_config WHERE sensor_type = ?').run(sensor_type);
  db.close();
}

export function getBrokerConfig(): BrokerConfig | null {
  const db = new Database(dbPath);
  const config = db.prepare('SELECT * FROM broker_config ORDER BY id DESC LIMIT 1').get() as BrokerConfig | undefined;
  db.close();
  return config || null;
}

export function updateBrokerConfig(broker_url: string) {
  const db = new Database(dbPath);
  const existing = db.prepare('SELECT id FROM broker_config ORDER BY id DESC LIMIT 1').get() as { id: number } | undefined;
  
  if (existing) {
    db.prepare('UPDATE broker_config SET broker_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(broker_url, existing.id);
  } else {
    db.prepare('INSERT INTO broker_config (broker_url) VALUES (?)').run(broker_url);
  }
  
  db.close();
}
