// src/app/api/top-performers/route.js
import { NextResponse } from 'next/server';
import { getTopPerformingDistricts } from '@/lib/api-helpers';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metric = searchParams.get('metric') || 'activeWorkers';
    const limitParam = searchParams.get('limit');
    const monthParam = searchParams.get('month');
    
    // Validate metric
    const validMetrics = [
      'totalWorkers',
      'activeWorkers',
      'jobCardsIssued',
      'workCompleted',
      'averageWage',
      'totalExpenditure',
      'personDaysGenerated',
    ];
    
    if (!validMetrics.includes(metric)) {
      return NextResponse.json(
        { 
          error: `Invalid metric. Valid metrics are: ${validMetrics.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Parse limit
    const limit = limitParam ? parseInt(limitParam) : 10;
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      );
    }
    
    // Parse month
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
    
    console.log(`API: Fetching top ${limit} performers by ${metric}`);
    
    const topDistricts = await getTopPerformingDistricts(metric, limit, month);
    
    return NextResponse.json({
      metric,
      limit,
      month: month.toISOString().slice(0, 7),
      districts: topDistricts,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch top performers', 
        message: error.message 
      },
      { status: 500 }
    );
  }
}