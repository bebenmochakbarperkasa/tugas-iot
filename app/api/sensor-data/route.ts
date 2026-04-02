import { NextRequest, NextResponse } from 'next/server';
import { insertSensorData } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sensor_type, value, unit } = body;

    if (!sensor_type || value === undefined) {
      return NextResponse.json(
        { error: 'sensor_type and value are required' },
        { status: 400 }
      );
    }

    const result = insertSensorData({
      sensor_type,
      value: parseFloat(value),
      unit,
    });

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    return NextResponse.json(
      { error: 'Failed to save sensor data' },
      { status: 500 }
    );
  }
}
