// src/app/api/compare/route.js
import { NextResponse } from 'next/server';
import { compareDistricts } from '@/lib/api-helpers';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const district1 = searchParams.get('district1');
    const district2 = searchParams.get('district2');
    const monthParam = searchParams.get('month');
    
    // Validate inputs
    if (!district1 || !district2) {
      return NextResponse.json(
        { error: 'Both district1 and district2 parameters are required' },
        { status: 400 }
      );
    }
    
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
    month.setDate(1); // First day of month
    
    console.log(`API: Comparing ${district1} vs ${district2} for ${month.toISOString().slice(0, 7)}`);
    
    const comparison = await compareDistricts(district1, district2, month);
    
    return NextResponse.json(comparison, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error comparing districts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to compare districts', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}