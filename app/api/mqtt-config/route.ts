import { NextRequest, NextResponse } from 'next/server';
import { getTopicConfigs, updateTopicConfig, initConfigTable } from '@/lib/config';

// Initialize config table on first load
initConfigTable();

export async function GET() {
  try {
    const configs = getTopicConfigs();
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('Error fetching MQTT configs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configurations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sensor_type, topic } = body;

    if (!sensor_type || !topic) {
      return NextResponse.json(
        { success: false, error: 'sensor_type and topic are required' },
        { status: 400 }
      );
    }

    updateTopicConfig(sensor_type, topic);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Configuration updated successfully' 
    });
  } catch (error) {
    console.error('Error updating MQTT config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
