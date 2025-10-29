// src/app/api/districts/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, state, district_code FROM districts ORDER BY name'
    );
    
    return NextResponse.json(result.rows, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch districts', message: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}