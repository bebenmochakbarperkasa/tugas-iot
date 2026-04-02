const mqtt = require('mqtt');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'iot-data.db');
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

// Create sensor_data table
db.exec(`
  CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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

// Note: Sensor configs are managed via /settings page, no defaults inserted here

// Insert default broker if not exists
const brokerCount = db.prepare('SELECT COUNT(*) as count FROM broker_config').get();
if (brokerCount.count === 0) {
  db.prepare('INSERT INTO broker_config (broker_url) VALUES (?)').run('mqtt://broker.hivemq.com');
}

// Load sensor configs from database
function loadSensorConfigs() {
  const configs = db.prepare('SELECT sensor_type, sensor_name, topic, unit FROM sensor_config').all();
  return configs;
}

// Create a map for quick lookup of sensor configs by topic
let sensorConfigMap = {};

// Load sensor configs and create map
const configs = loadSensorConfigs();
configs.forEach(config => {
  sensorConfigMap[config.topic] = config;
});
console.log('📋 Sensor Config Map:');
Object.entries(sensorConfigMap).forEach(([topic, config]) => {
  console.log(`   Topic: "${topic}" → ${config.sensor_type} (${config.unit})`);
});

// Function to get broker URL from database
function getBrokerUrl() {
  const result = db.prepare('SELECT broker_url FROM broker_config ORDER BY id DESC LIMIT 1').get();
  return result ? result.broker_url : 'mqtt://broker.hivemq.com';
}

// Get broker URL after tables are created
const MQTT_BROKER = getBrokerUrl();

// MQTT connection options with credentials
const mqttOptions = {
  username: 'test-iot',
  password: 'Test12345',
  port: 8883,
  protocol: 'mqtts'
};

console.log('🔌 Connecting to MQTT broker:', MQTT_BROKER);
const client = mqtt.connect(MQTT_BROKER, mqttOptions);

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  
  // Subscribe to topics from sensor configs
  Object.keys(sensorConfigMap).forEach(topic => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to ${topic}:`, err);
      } else {
        console.log(`📡 Subscribed to topic: ${topic}`);
      }
    });
  });
});

client.on('message', (topic, message) => {
  try {
    const messageStr = message.toString();
    console.log(`📨 Received message on ${topic}: ${messageStr}`);
    
    // Skip invalid or non-JSON messages
    if (!messageStr || messageStr.trim() === '' || messageStr === 'nan') {
      console.log('⚠️  Skipping invalid message');
      return;
    }
    
    // Get sensor config from map
    const sensorConfig = sensorConfigMap[topic];
    if (!sensorConfig) {
      console.log(`⚠️  No config found for topic: "${topic}"`);
      return;
    }
    
    let value;
    let unit = sensorConfig.unit;
    const trimmed = messageStr.trim();
    
    // Handle ON/OFF text messages (e.g. for gerak/motion sensor)
    let isOnOff = false;
    if (trimmed.toUpperCase() === 'ON') {
      value = 1;
      isOnOff = true;
    } else if (trimmed.toUpperCase() === 'OFF') {
      value = 0;
      isOnOff = true;
    } else {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'number') {
          value = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          value = parsed.value || parsed.temperature || parsed.humidity || parsed.pressure;
          unit = parsed.unit || sensorConfig.unit;
        }
      } catch (parseError) {
        // Not valid JSON, try as plain number
        const numValue = parseFloat(trimmed);
        if (!isNaN(numValue)) {
          value = numValue;
        } else {
          console.log(`⚠️  Cannot parse message: ${trimmed}`);
          return;
        }
      }
    }
    
    // Validate value
    if (value === undefined || value === null) {
      console.log(`⚠️  No value extracted from message: ${trimmed}`);
      return;
    }
    
    const sensorType = sensorConfig.sensor_type;
    
    const stmt = db.prepare(`
      INSERT INTO sensor_data (sensor_type, value, unit)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(sensorType, value, unit);
    const displayValue = isOnOff ? (value === 1 ? 'ON' : 'OFF') : `${value} ${unit}`;
    console.log(`💾 Saved: ${sensorConfig.sensor_name} = ${displayValue}`);
    
  } catch (error) {
    console.error('❌ Error processing message:', error);
  }
});

client.on('error', (error) => {
  console.error('❌ MQTT Error:', error);
});

client.on('offline', () => {
  console.log('⚠️  MQTT client offline');
});

client.on('reconnect', () => {
  console.log('🔄 Reconnecting to MQTT broker...');
});

process.on('SIGINT', () => {
  console.log('\n👋 Closing MQTT connection...');
  client.end();
  db.close();
  process.exit(0);
});

console.log('🚀 MQTT Subscriber is running...');
console.log('� Topics will be loaded from database on connection');
console.log('💡 Press Ctrl+C to stop\n');
