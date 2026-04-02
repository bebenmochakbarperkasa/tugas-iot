const mqtt = require('mqtt');

const MQTT_BROKER = 'mqtts://729ed9997932469090ce4f1d9eeff994.s1.eu.hivemq.cloud';

// MQTT connection options with credentials
const mqttOptions = {
  username: 'test-iot',
  password: 'Test12345',
  port: 8883,
  protocol: 'mqtts'
};

const client = mqtt.connect(MQTT_BROKER, mqttOptions);

console.log('🔌 Connecting to MQTT broker:', MQTT_BROKER);

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  console.log('📡 Starting to publish test data every 5 seconds...\n');
  
  setInterval(() => {
    const suhu = (20 + Math.random() * 15).toFixed(1);
    const kelembaban = (40 + Math.random() * 40).toFixed(1);
    const tekanan = (1000 + Math.random() * 30).toFixed(1);
    const cahaya = (100 + Math.random() * 900).toFixed(1);
    const jarak = (Math.random() * 400).toFixed(1);
    
    const suhuPayload = JSON.stringify({ value: parseFloat(suhu), unit: '°C' });
    const kelembabanPayload = JSON.stringify({ value: parseFloat(kelembaban), unit: '%' });
    const tekananPayload = JSON.stringify({ value: parseFloat(tekanan), unit: 'hPa' });
    const cahayaPayload = JSON.stringify({ value: parseFloat(cahaya), unit: 'lux' });
    const jarakPayload = JSON.stringify({ value: parseFloat(jarak), unit: 'cm' });
    
    client.publish('rumah/sensor/suhu', suhuPayload);
    client.publish('rumah/sensor/kelembaban', kelembabanPayload);
    client.publish('rumah/sensor/tekanan', tekananPayload);
    client.publish('rumah/sensor/cahaya', cahayaPayload);
    client.publish('rumah/sensor/jarak', jarakPayload);
    
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    console.log(`📤 Published at ${time}:`);
    console.log(`   🌡️  Suhu: ${suhu}°C`);
    console.log(`   💧 Kelembaban: ${kelembaban}%`);
    console.log(`   📊 Tekanan: ${tekanan}hPa`);
    console.log(`   💡 Cahaya: ${cahaya}lux`);
    console.log(`   📏 Jarak: ${jarak}cm\n`);
  }, 5000);
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
  console.log('\n👋 Stopping test publisher...');
  client.end();
  process.exit(0);
});

console.log('💡 Press Ctrl+C to stop\n');
