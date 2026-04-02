import { NextResponse } from 'next/server';
import { getAllLatestData } from '@/lib/db';

export async function GET() {
  try {
    const data = getAllLatestData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching latest data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
