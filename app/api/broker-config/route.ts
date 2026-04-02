import { NextRequest, NextResponse } from 'next/server';
import { getBrokerConfig, updateBrokerConfig, initConfigTable } from '@/lib/config';

// Initialize config table on first load
initConfigTable();

export async function GET() {
  try {
    const config = getBrokerConfig();
    return NextResponse.json({ 
      success: true, 
      data: config || { broker_url: 'mqtt://broker.hivemq.com' }
    });
  } catch (error) {
    console.error('Error fetching broker config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch broker configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { broker_url } = body;

    if (!broker_url) {
      return NextResponse.json(
        { success: false, error: 'broker_url is required' },
        { status: 400 }
      );
    }

    // Validate broker URL format
    if (!broker_url.startsWith('mqtt://') && !broker_url.startsWith('mqtts://')) {
      return NextResponse.json(
        { success: false, error: 'Broker URL must start with mqtt:// or mqtts://' },
        { status: 400 }
      );
    }

    updateBrokerConfig(broker_url);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Broker configuration updated successfully' 
    });
  } catch (error) {
    console.error('Error updating broker config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update broker configuration' },
      { status: 500 }
    );
  }
}
