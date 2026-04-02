import { NextRequest, NextResponse } from 'next/server';
import { getSensorConfigs, updateSensorConfig, addSensorConfig, deleteSensorConfig, initConfigTable, SensorConfig } from '@/lib/config';

// Initialize config table on first load
initConfigTable();

export async function GET() {
  try {
    const configs = getSensorConfigs();
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('Error fetching sensor configs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sensor configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sensor_type, sensor_name, topic, unit, icon, color, bg_gradient } = body;

    if (!sensor_type || !sensor_name || !topic || !unit) {
      return NextResponse.json(
        { success: false, error: 'sensor_type, sensor_name, topic, and unit are required' },
        { status: 400 }
      );
    }

    const config: Omit<SensorConfig, 'id' | 'updated_at'> = {
      sensor_type,
      sensor_name,
      topic,
      unit,
      icon: icon || '📡',
      color: color || 'rgb(107, 114, 128)',
      bg_gradient: bg_gradient || 'bg-gradient-to-br from-gray-500 to-gray-600'
    };

    addSensorConfig(config);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sensor added successfully' 
    });
  } catch (error: any) {
    console.error('Error adding sensor:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        { success: false, error: 'Sensor with this type already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to add sensor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sensor_type, sensor_name, topic, unit, icon, color, bg_gradient } = body;

    if (!sensor_type || !sensor_name || !topic || !unit) {
      return NextResponse.json(
        { success: false, error: 'sensor_type, sensor_name, topic, and unit are required' },
        { status: 400 }
      );
    }

    const config: SensorConfig = {
      sensor_type,
      sensor_name,
      topic,
      unit,
      icon: icon || '📡',
      color: color || 'rgb(107, 114, 128)',
      bg_gradient: bg_gradient || 'bg-gradient-to-br from-gray-500 to-gray-600'
    };

    updateSensorConfig(config);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sensor updated successfully' 
    });
  } catch (error) {
    console.error('Error updating sensor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sensor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sensor_type = searchParams.get('sensor_type');

    if (!sensor_type) {
      return NextResponse.json(
        { success: false, error: 'sensor_type is required' },
        { status: 400 }
      );
    }

    deleteSensorConfig(sensor_type);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sensor deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting sensor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sensor' },
      { status: 500 }
    );
  }
}
