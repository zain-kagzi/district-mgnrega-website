// src/app/api/district/[code]/route.js
import { NextResponse } from 'next/server';
import { fetchDistrictData, fetchHistoricalData } from '@/lib/mgnrega-api';

export async function GET(request, { params }) {
  try {
    const { code } = await params;
    const searchParams = request.nextUrl.searchParams;
    const historical = searchParams.get('historical') === 'true';
    const monthsParam = searchParams.get('months');
    
    // Validate district code
    if (!code || code.trim() === '') {
      return NextResponse.json(
        { error: 'District code is required' },
        { status: 400 }
      );
    }
    
    if (historical) {
      // Fetch historical data
      const months = monthsParam ? parseInt(monthsParam) : 12;
      
      if (isNaN(months) || months < 1 || months > 24) {
        return NextResponse.json(
          { error: 'Months must be between 1 and 24' },
          { status: 400 }
        );
      }
      
      console.log(`API: Fetching ${months} months of historical data for ${code}`);
      const data = await fetchHistoricalData(code, months);
      
      return NextResponse.json(data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    } else {
      // Fetch current month data
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of current month
      
      console.log(`API: Fetching current month data for ${code}`);
      const data = await fetchDistrictData(code, currentMonth);
      
      return NextResponse.json(data, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching district data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch district data', 
        message: error.message,
        code: params.code 
      },
      { status: 500 }
    );
  }
}