// src/app/api/health/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getCacheStats } from '@/lib/cache';

export async function GET() {
  let client;
  try {
    // Check database connection
    client = await pool.connect();
    const dbResult = await client.query('SELECT NOW()');
    const dbConnected = dbResult.rows.length > 0;
    
    // Check districts count
    const districtsResult = await client.query('SELECT COUNT(*) as count FROM districts');
    const districtsCount = parseInt(districtsResult.rows[0].count);
    
    // Check performance data count
    const performanceResult = await client.query('SELECT COUNT(*) as count FROM district_performance');
    const performanceCount = parseInt(performanceResult.rows[0].count);
    
    // Get cache stats
    const cacheStats = await getCacheStats();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        districts: districtsCount,
        performanceRecords: performanceCount,
      },
      cache: {
        total: cacheStats.total,
        active: cacheStats.active,
        expired: cacheStats.expired,
      },
      version: '1.0.0',
    };
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  } finally {
    if (client) client.release();
  }
}