// src/app/api/location/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Simple reverse geocoding for demo
// In production, use Google Maps API, OpenStreetMap, or similar service
async function reverseGeocode(latitude, longitude) {
  // This is a placeholder - in production you would call a geocoding API
  // For now, we'll return a random district from UP
  
  // You can integrate with actual geocoding APIs like:
  // - Google Maps Geocoding API
  // - OpenStreetMap Nominatim
  // - MapBox Geocoding API
  
  console.log(`Reverse geocoding coordinates: ${latitude}, ${longitude}`);
  
  // For demo purposes, return a random district
  return null; // Will trigger random selection below
}

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    const { latitude, longitude } = body;
    
    // Validate coordinates
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }
    
    if (
      isNaN(latitude) || 
      isNaN(longitude) || 
      latitude < -90 || 
      latitude > 90 || 
      longitude < -180 || 
      longitude > 180
    ) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }
    
    console.log(`Location API called with: lat=${latitude}, lng=${longitude}`);
    
    // Try to reverse geocode
    let districtName = await reverseGeocode(latitude, longitude);
    
    client = await pool.connect();
    
    if (districtName) {
      // Try to find the district in database
      const result = await client.query(
        'SELECT district_code, name, state FROM districts WHERE name ILIKE $1 LIMIT 1',
        [`%${districtName}%`]
      );
      
      if (result.rows.length > 0) {
        return NextResponse.json({
          district_code: result.rows[0].district_code,
          name: result.rows[0].name,
          state: result.rows[0].state,
          detected: true,
        });
      }
    }
    
    // Fallback: Return a random UP district for demo
    const result = await client.query(
      'SELECT district_code, name, state FROM districts WHERE state = $1 ORDER BY RANDOM() LIMIT 1',
      ['Uttar Pradesh']
    );
    
    if (result.rows.length > 0) {
      return NextResponse.json({
        district_code: result.rows[0].district_code,
        name: result.rows[0].name,
        state: result.rows[0].state,
        detected: false, // Indicate this is a fallback
        message: 'Location detected, showing nearby district',
      });
    }
    
    return NextResponse.json(
      { error: 'No districts found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error detecting location:', error);
    return NextResponse.json(
      { 
        error: 'Failed to detect location', 
        message: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}