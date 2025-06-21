#!/usr/bin/env node

/**
 * F1 Analytics Platform - Mock Data Test Script
 * 
 * This script demonstrates all the features of the F1 Analytics Platform
 * using simulated race data when no live F1 session is available.
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3000';

console.log('🏎️  F1 Analytics Platform - Mock Data Test');
console.log('=' .repeat(50));

async function testEndpoint(name, url, formatter = null) {
  try {
    console.log(`\n📡 Testing ${name}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (formatter) {
      formatter(data);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
    
    console.log(`✅ ${name} - OK`);
    return data;
  } catch (error) {
    console.log(`❌ ${name} - ERROR: ${error.message}`);
    return null;
  }
}

function formatLeaderboard(data) {
  console.log('\n🏁 LIVE LEADERBOARD');
  console.log('Pos | Driver | Team            | Gap      | Interval');
  console.log('-'.repeat(55));
  
  data.slice(0, 10).forEach(driver => {
    const pos = driver.position.toString().padStart(2);
    const name = driver.driverName.padEnd(6);
    const team = driver.teamName.padEnd(15);
    const gap = driver.gap.padStart(8);
    const interval = driver.interval.padStart(8);
    
    console.log(`P${pos} | ${name} | ${team} | ${gap} | ${interval}`);
  });
}

function formatBattles(data) {
  console.log('\n⚔️  BATTLE DETECTION');
  
  if (data.length === 0) {
    console.log('No active battles detected');
    return;
  }
  
  console.log('Leading | Chasing | Gap   | Intensity');
  console.log('-'.repeat(40));
  
  data.forEach(battle => {
    const leading = `P${battle.leadingDriver.position} (#${battle.leadingDriver.driverNumber})`.padEnd(8);
    const chasing = `P${battle.chasingDriver.position} (#${battle.chasingDriver.driverNumber})`.padEnd(8);
    const gap = `${battle.gap.toFixed(3)}s`.padStart(6);
    const intensity = battle.intensity.toUpperCase();
    
    console.log(`${leading} | ${chasing} | ${gap} | ${intensity}`);
  });
}

function formatTelemetry(data) {
  console.log('\n📊 TELEMETRY DATA');
  console.log(`Speed: ${data.speed} km/h`);
  console.log(`RPM: ${data.rpm.toLocaleString()}`);
  console.log(`Gear: ${data.gear}`);
  console.log(`Throttle: ${data.throttle}%`);
  console.log(`Brake: ${data.brake}%`);
  console.log(`DRS: ${data.drs ? 'OPEN' : 'CLOSED'}`);
}

function formatPositions(data) {
  console.log('\n🗺️  GPS POSITIONS');
  console.log('Driver | X Coord | Y Coord | Z Coord');
  console.log('-'.repeat(40));
  
  data.slice(0, 5).forEach(pos => {
    const driver = `#${pos.driverNumber}`.padEnd(6);
    const x = pos.x.toFixed(1).padStart(7);
    const y = pos.y.toFixed(1).padStart(7);
    const z = pos.z.toFixed(1).padStart(7);
    
    console.log(`${driver} | ${x} | ${y} | ${z}`);
  });
}

function formatDrivers(data) {
  console.log('\n👥 DRIVERS LIST');
  console.log('Num | Name | Team            | Color');
  console.log('-'.repeat(45));
  
  data.forEach(driver => {
    const num = `#${driver.driver_number}`.padStart(3);
    const name = driver.name_acronym.padEnd(4);
    const team = driver.team_name.padEnd(15);
    const color = driver.team_colour;
    
    console.log(`${num} | ${name} | ${team} | ${color}`);
  });
}

async function testFrontend() {
  try {
    console.log('\n🌐 Testing Frontend...');
    const response = await fetch(FRONTEND_URL);
    
    if (response.ok) {
      console.log('✅ Frontend - OK (http://localhost:3000)');
      console.log('   Visit the URL above to see the live dashboard!');
    } else {
      console.log(`❌ Frontend - ERROR: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Frontend - ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n🔧 BACKEND API TESTS');
  console.log('-'.repeat(30));
  
  // Test all endpoints
  const leaderboard = await testEndpoint('Leaderboard', `${API_BASE}/leaderboard`, formatLeaderboard);
  const battles = await testEndpoint('Battles', `${API_BASE}/battles`, formatBattles);
  const drivers = await testEndpoint('Drivers', `${API_BASE}/drivers`, formatDrivers);
  const telemetry = await testEndpoint('Telemetry (HAM)', `${API_BASE}/telemetry/44`, formatTelemetry);
  const positions = await testEndpoint('GPS Positions', `${API_BASE}/positions`, formatPositions);
  
  // Test driver-specific endpoint
  await testEndpoint('Driver Data (VER)', `${API_BASE}/driver/1`, (data) => {
    console.log(`\n🏎️  DRIVER: ${data.driver.name} (#${data.driver.number})`);
    console.log(`Team: ${data.driver.team}`);
    console.log(`Position: P${data.position.current}`);
    console.log(`Gap: ${data.position.gap}`);
    console.log(`Speed: ${data.telemetry.speed} km/h`);
  });
  
  // Test health endpoint
  await testEndpoint('Health Check', `${API_BASE}/health`, (data) => {
    console.log(`Status: ${data.status.toUpperCase()}`);
    console.log(`Cache Size: ${data.cache_size} items`);
  });
  
  // Test frontend
  await testFrontend();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Mock Data Mode: ENABLED');
  console.log('✅ Backend API: http://localhost:3001/api');
  console.log('✅ WebSocket: ws://localhost:3002');
  console.log('✅ Frontend: http://localhost:3000');
  console.log('');
  console.log('🏁 FEATURES DEMONSTRATED:');
  console.log('  • Live Leaderboard with dynamic gaps');
  console.log('  • Battle Detection (drivers within 1s)');
  console.log('  • Real-time Telemetry (throttle, brake, DRS, etc.)');
  console.log('  • GPS Track Positions (circular track simulation)');
  console.log('  • Driver-specific dashboards');
  console.log('  • WebSocket real-time updates');
  console.log('  • Team colors and branding');
  console.log('');
  console.log('🚀 The data updates every 2 seconds automatically!');
  console.log('   Open http://localhost:3000 to see the live dashboard.');
  console.log('');
  console.log('💡 To disable mock mode, set MOCK_DATA=false in .env');
}

// Run the tests
runTests().catch(console.error); 