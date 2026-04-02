'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SensorCard from './components/SensorCard';
import SensorChart from './components/SensorChart';

interface SensorData {
  id: number;
  sensor_type: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface HistoricalData {
  [key: string]: Array<{ timestamp: string; value: number }>;
}

interface SensorConfigData {
  sensor_type: string;
  sensor_name: string;
  icon: string;
  color: string;
  bg_gradient: string;
  unit: string;
}

export default function Dashboard() {
  const [latestData, setLatestData] = useState<SensorData[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  const [sensorConfigs, setSensorConfigs] = useState<SensorConfigData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLatestData = async () => {
    try {
      // Add timestamp to bypass cache
      const response = await fetch(`/api/sensor-data/latest?t=${Date.now()}`);
      const result = await response.json();
      if (result.data) {
        const filtered = result.data.filter((d: any) => d !== null);
        
        console.log('📊 Sensor Configs:', sensorConfigs.map(c => c.sensor_type));
        console.log('📊 Raw Data:', filtered.map((d: SensorData) => d.sensor_type));
        
        // If sensor configs are loaded, only show configured sensors
        if (sensorConfigs.length > 0) {
          // Create a map of configured sensor types for quick lookup
          const configuredTypes = new Set(sensorConfigs.map(c => c.sensor_type));
          
          console.log('📊 Configured Types:', Array.from(configuredTypes));
          
          // Filter data to only include configured sensors
          const configuredData = filtered.filter((d: SensorData) => 
            configuredTypes.has(d.sensor_type)
          );
          
          console.log('📊 Filtered Data:', configuredData.map((d: SensorData) => d.sensor_type));
          
          // Merge with configs to show all configured sensors (even without data)
          const mergedData: SensorData[] = sensorConfigs.map(config => {
            const existingData = configuredData.find((d: SensorData) => d.sensor_type === config.sensor_type);
            if (existingData) {
              return existingData;
            }
            // Return placeholder data for sensors without data
            return {
              id: 0,
              sensor_type: config.sensor_type,
              value: 0,
              unit: config.unit,
              timestamp: new Date().toISOString()
            };
          });
          
          console.log('📊 Final Merged Data:', mergedData.map((d: SensorData) => d.sensor_type));
          setLatestData(mergedData);
        } else {
          console.log('⚠️ Configs not loaded yet, showing all data');
          // If configs not loaded yet, just show actual data
          setLatestData(filtered);
        }
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
    }
  };

  const fetchHistoricalData = async (sensorType: string) => {
    try {
      const response = await fetch(`/api/sensor-data/history?sensor_type=${sensorType}&limit=20`);
      const result = await response.json();
      if (result.data) {
        setHistoricalData(prev => ({
          ...prev,
          [sensorType]: result.data,
        }));
      }
    } catch (error) {
      console.error(`Error fetching historical data for ${sensorType}:`, error);
    }
  };

  const fetchSensorConfigs = async () => {
    try {
      const response = await fetch('/api/sensors');
      const result = await response.json();
      if (result.success && result.data) {
        setSensorConfigs(result.data);
      }
    } catch (error) {
      console.error('Error fetching sensor configs:', error);
    }
  };

  // Load sensor configs on mount
  useEffect(() => {
    fetchSensorConfigs();
    
    // Refresh sensor configs every 10 seconds to detect new sensors
    const configInterval = setInterval(fetchSensorConfigs, 10000);
    
    return () => {
      clearInterval(configInterval);
    };
  }, []);

  // Load data when configs are ready
  useEffect(() => {
    if (sensorConfigs.length > 0) {
      console.log('✅ Configs loaded, fetching data...');
      fetchLatestData();
      setLoading(false);
      
      // Refresh sensor data every 3 seconds
      const dataInterval = setInterval(fetchLatestData, 3000);
      
      return () => {
        clearInterval(dataInterval);
      };
    }
  }, [sensorConfigs]);

  useEffect(() => {
    if (latestData.length === 0) return;

    latestData.forEach(sensor => {
      if (!historicalData[sensor.sensor_type]) {
        fetchHistoricalData(sensor.sensor_type);
      }
    });

    const interval = setInterval(() => {
      latestData.forEach(sensor => {
        fetchHistoricalData(sensor.sensor_type);
      });
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestData.length]);

  const getSensorConfig = (type: string) => {
    // Get config from database
    const dbConfig = sensorConfigs.find(c => c.sensor_type === type);
    if (dbConfig) {
      return {
        icon: dbConfig.icon,
        color: dbConfig.color,
        bgGradient: dbConfig.bg_gradient
      };
    }
    // Fallback if not found in database
    return { 
      icon: '�', 
      color: 'rgb(107, 114, 128)', 
      bgGradient: 'bg-gradient-to-br from-gray-500 to-gray-600' 
    };
  };

  const getChartColor = (type: string) => {
    const colors: { [key: string]: string } = {
      suhu: 'rgb(239, 68, 68)',
      kelembaban: 'rgb(59, 130, 246)',
      tekanan: 'rgb(168, 85, 247)',
    };
    return colors[type] || 'rgb(107, 114, 128)';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">IoT Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600 font-medium">📡 Real-time Sensor Monitoring System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-green-400 to-emerald-500 px-5 py-3 rounded-full shadow-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="text-sm font-bold text-white">LIVE</span>
              </div>
              <Link 
                href="/settings"
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-5 py-3 rounded-lg shadow-md hover:shadow-lg transition-all text-white font-semibold"
              >
                <span className="text-xl">⚙️</span>
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {latestData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📡</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Sensor Data Yet</h2>
            <p className="text-gray-500">
              Waiting for MQTT messages... Make sure the MQTT subscriber is running.
            </p>
            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-sm text-gray-600 font-mono">
                npm run mqtt
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg mr-3">📊</span>
                Sensor Readings
              </h2>
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {latestData.map((sensor) => {
                const config = getSensorConfig(sensor.sensor_type);
                const sensorConfig = sensorConfigs.find(c => c.sensor_type === sensor.sensor_type);
                return (
                  <SensorCard
                    key={sensor.id}
                    title={sensorConfig?.sensor_name || sensor.sensor_type.charAt(0).toUpperCase() + sensor.sensor_type.slice(1)}
                    value={sensor.value}
                    unit={sensor.unit}
                    icon={config.icon}
                    color={config.color}
                    bgGradient={config.bgGradient}
                  />
                );
              })}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg mr-3">📈</span>
                Historical Data
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {latestData.map((sensor) => {
                const data = historicalData[sensor.sensor_type] || [];
                if (data.length === 0) return null;
                
                return (
                  <SensorChart
                    key={sensor.sensor_type}
                    title={`${sensor.sensor_type.charAt(0).toUpperCase() + sensor.sensor_type.slice(1)} History`}
                    data={data}
                    color={getChartColor(sensor.sensor_type)}
                    unit={sensor.unit}
                  />
                );
              })}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="mt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Last updated: {new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </footer>
    </div>
  );
}
