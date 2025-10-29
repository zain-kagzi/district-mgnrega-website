// src/app/api/state/[state]/route.js
import { NextResponse } from 'next/server';
import { getStateStatistics } from '@/lib/api-helpers';

export async function GET(request, { params }) {
  try {
    const { state } = params;
    const searchParams = request.nextUrl.searchParams;
    const monthParam = searchParams.get('month');
    
    // Parse month or use current month
    let month;
    if (monthParam) {
      month = new Date(monthParam);
      if (isNaN(month.getTime())) {
        return NextResponse.json(
          { error: 'Invalid month format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }
    } else {
      month = new Date();
    }
    month.setDate(1);
    
    console.log(`API: Fetching state statistics for ${state} - ${month.toISOString().slice(0, 7)}`);
    
    const stats = await getStateStatistics(state, month);
    
    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching state statistics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch state statistics', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}