const http = require('http');

console.log('🧪 Testing API endpoints...\n');

// Test latest data endpoint
const options = {
  hostname: 'localhost',
  port: 3312,
  path: '/api/sensor-data/latest',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📡 API Response Status:', res.statusCode);
    console.log('📦 Response Data:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.data && parsed.data.length > 0) {
        console.log('\n✅ API is working! Found', parsed.data.length, 'sensors');
      } else {
        console.log('\n⚠️  API returned empty data array');
      }
    } catch (e) {
      console.log('❌ Failed to parse JSON:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ API Error:', error.message);
  console.log('\n💡 Make sure Next.js dev server is running on port 3312');
});

req.end();
