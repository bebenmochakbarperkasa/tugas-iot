import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalData } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sensorType = searchParams.get('sensor_type');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!sensorType) {
      return NextResponse.json(
        { error: 'sensor_type parameter is required' },
        { status: 400 }
      );
    }

    const data = getHistoricalData(sensorType, limit);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
