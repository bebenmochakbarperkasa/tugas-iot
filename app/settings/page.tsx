'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SensorConfig {
  id: number;
  sensor_type: string;
  sensor_name: string;
  topic: string;
  unit: string;
  icon: string;
  color: string;
  bg_gradient: string;
  updated_at: string;
}

interface BrokerConfig {
  broker_url: string;
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<SensorConfig[]>([]);
  const [brokerConfig, setBrokerConfig] = useState<BrokerConfig>({ broker_url: 'mqtt://broker.hivemq.com' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingBroker, setEditingBroker] = useState(false);
  const [newSensor, setNewSensor] = useState({
    sensor_type: '',
    sensor_name: '',
    topic: '',
    unit: '',
    icon: '📡',
    color: 'rgb(107, 114, 128)',
    bg_gradient: 'bg-gradient-to-br from-gray-500 to-gray-600'
  });

  useEffect(() => {
    fetchConfigs();
    fetchBrokerConfig();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/sensors');
      const data = await response.json();
      if (data.success) {
        setConfigs(data.data);
      }
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokerConfig = async () => {
    try {
      const response = await fetch('/api/broker-config');
      const data = await response.json();
      if (data.success && data.data) {
        setBrokerConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching broker config:', error);
    }
  };

  const handleFieldChange = (id: number, field: keyof SensorConfig, value: string) => {
    setConfigs(configs.map(config => 
      config.id === id ? { ...config, [field]: value } : config
    ));
  };

  const handleSave = async (config: SensorConfig) => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/sensors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: `Sensor ${config.sensor_name} berhasil diupdate!` });
        setEditingId(null);
        fetchConfigs();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan konfigurasi' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan' });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSensor)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Sensor baru berhasil ditambahkan!' });
        setShowAddForm(false);
        setNewSensor({
          sensor_type: '',
          sensor_name: '',
          topic: '',
          unit: '',
          icon: '📡',
          color: 'rgb(107, 114, 128)',
          bg_gradient: 'bg-gradient-to-br from-gray-500 to-gray-600'
        });
        fetchConfigs();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menambahkan sensor' });
      }
    } catch (error) {
      console.error('Error adding sensor:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menambahkan sensor' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sensor_type: string, sensor_name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus sensor ${sensor_name}?`)) {
      return;
    }

    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/sensors?sensor_type=${sensor_type}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: `Sensor ${sensor_name} berhasil dihapus!` });
        fetchConfigs();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus sensor' });
      }
    } catch (error) {
      console.error('Error deleting sensor:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus sensor' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBroker = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/broker-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broker_url: brokerConfig.broker_url })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Konfigurasi broker berhasil diupdate! Restart MQTT subscriber untuk menerapkan perubahan.' });
        setEditingBroker(false);
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menyimpan konfigurasi broker' });
      }
    } catch (error) {
      console.error('Error saving broker config:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menyimpan konfigurasi broker' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold mb-4"
          >
            ← Kembali ke Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ Pengaturan Sensor</h1>
          <p className="text-gray-600">Kelola konfigurasi sensor dan MQTT broker</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* MQTT Broker Configuration */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🌐 Konfigurasi MQTT Broker</h2>
          </div>
          {editingBroker ? (
            <div className="space-y-3">
              <input
                type="text"
                value={brokerConfig.broker_url}
                onChange={(e) => setBrokerConfig({ broker_url: e.target.value })}
                placeholder="mqtt://broker.hivemq.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-gray-800 font-mono bg-white"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveBroker}
                  disabled={saving || !brokerConfig.broker_url}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold bg-white text-indigo-600 hover:bg-indigo-50 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {saving ? 'Menyimpan...' : '💾 Simpan'}
                </button>
                <button
                  onClick={() => {
                    setEditingBroker(false);
                    fetchBrokerConfig();
                  }}
                  className="px-4 py-2 rounded-lg font-semibold bg-white/20 hover:bg-white/30 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Alamat Broker:</p>
                <p className="text-xl font-mono font-bold text-gray-900">{brokerConfig.broker_url}</p>
              </div>
              <button
                onClick={() => setEditingBroker(true)}
                className="w-full py-2 px-4 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                ✏️ Edit Broker
              </button>
            </div>
          )}
        </div>

        {/* Sensor Configurations */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">📡 Konfigurasi Sensor</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <span className="text-xl">{showAddForm ? '✕' : '+'}</span>
              <span>{showAddForm ? 'Batal' : 'Tambah Sensor Baru'}</span>
            </button>
          </div>
          {showAddForm && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tipe Sensor (contoh: cahaya)"
                  value={newSensor.sensor_type}
                  onChange={(e) => setNewSensor({...newSensor, sensor_type: e.target.value})}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Nama Sensor (contoh: Cahaya)"
                  value={newSensor.sensor_name}
                  onChange={(e) => setNewSensor({...newSensor, sensor_name: e.target.value})}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Topic MQTT (contoh: sensor/cahaya)"
                  value={newSensor.topic}
                  onChange={(e) => setNewSensor({...newSensor, topic: e.target.value})}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-mono"
                />
                <input
                  type="text"
                  placeholder="Satuan (contoh: lux)"
                  value={newSensor.unit}
                  onChange={(e) => setNewSensor({...newSensor, unit: e.target.value})}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Icon (contoh: 💡)"
                value={newSensor.icon}
                onChange={(e) => setNewSensor({...newSensor, icon: e.target.value})}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-2xl"
              />
              <button
                onClick={handleAdd}
                disabled={saving || !newSensor.sensor_type || !newSensor.sensor_name || !newSensor.topic || !newSensor.unit}
                className="mt-4 w-full py-3 px-6 rounded-lg font-semibold text-white transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-600 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Menambahkan...' : 'Tambah Sensor'}
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Sensor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic MQTT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {configs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === config.id ? (
                        <input
                          type="text"
                          value={config.icon}
                          onChange={(e) => handleFieldChange(config.id, 'icon', e.target.value)}
                          className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="text-2xl">{config.icon}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === config.id ? (
                        <input
                          type="text"
                          value={config.sensor_type}
                          onChange={(e) => handleFieldChange(config.id, 'sensor_type', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="text-sm font-mono text-gray-900">{config.sensor_type}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === config.id ? (
                        <input
                          type="text"
                          value={config.sensor_name}
                          onChange={(e) => handleFieldChange(config.id, 'sensor_name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-900">{config.sensor_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === config.id ? (
                        <input
                          type="text"
                          value={config.topic}
                          onChange={(e) => handleFieldChange(config.id, 'topic', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-600 font-mono">{config.topic}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === config.id ? (
                        <input
                          type="text"
                          value={config.unit}
                          onChange={(e) => handleFieldChange(config.id, 'unit', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">{config.unit}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === config.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.color.startsWith('rgb') ? '#000000' : config.color}
                            onChange={(e) => handleFieldChange(config.id, 'color', e.target.value)}
                            className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={config.color}
                            onChange={(e) => handleFieldChange(config.id, 'color', e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                            placeholder="rgb(255, 0, 0) or #ff0000"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: config.color }}></div>
                          <span className="text-xs text-gray-500 font-mono">{config.color}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === config.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleSave(config)}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? '...' : '💾 Simpan'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={saving}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingId(config.id)}
                            className="text-blue-600 hover:text-blue-900 font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(config.sensor_type, config.sensor_name)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {configs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada sensor yang dikonfigurasi.</p>
                <p className="text-sm mt-2">Klik tombol "Tambah Sensor Baru" untuk menambahkan sensor.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center">
            <span className="mr-2">ℹ️</span>
            Informasi Penting
          </h3>
          <ul className="text-blue-800 space-y-1 text-sm list-disc list-inside">
            <li>Setelah menambah/edit/hapus sensor, restart MQTT subscriber untuk menerapkan perubahan</li>
            <li>Format topic: <code className="bg-blue-100 px-2 py-1 rounded">sensor/nama_sensor</code></li>
            <li>Tipe sensor harus unik (tidak boleh duplikat)</li>
            <li>Icon bisa menggunakan emoji (💧 🌡️ 📊 💡 🌬️ dll)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
