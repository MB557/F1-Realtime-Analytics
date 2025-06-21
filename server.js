import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { OpenF1DataService } from './services/openf1-service.js';
import { CacheService } from './services/cache-service.js';
import { DataNormalizer } from './services/data-normalizer.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Configuration
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize services
const openF1Service = new OpenF1DataService();
const cacheService = new CacheService();
const dataNormalizer = new DataNormalizer();

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// WebSocket Server
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server running on port ${WS_PORT}`);

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Broadcast data to all connected clients
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}

// REST API Routes

// GET /api/leaderboard - Live leaderboard data
app.get('/api/leaderboard', async (req, res) => {
  try {
    const cachedData = cacheService.get('leaderboard');
    if (cachedData) {
      return res.json(cachedData);
    }

    const positions = await openF1Service.getPositions();
    const drivers = await openF1Service.getDrivers();
    const leaderboard = dataNormalizer.normalizeLeaderboard(positions, drivers);
    
    cacheService.set('leaderboard', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// GET /api/battles - Battle detection (drivers within 1s)
app.get('/api/battles', async (req, res) => {
  try {
    const cachedData = cacheService.get('battles');
    if (cachedData) {
      return res.json(cachedData);
    }

    const positions = await openF1Service.getPositions();
    const battles = dataNormalizer.detectBattles(positions);
    
    cacheService.set('battles', battles);
    res.json(battles);
  } catch (error) {
    console.error('Error detecting battles:', error);
    res.status(500).json({ error: 'Failed to detect battles' });
  }
});

// GET /api/telemetry/:driver - Telemetry per car
app.get('/api/telemetry/:driver', async (req, res) => {
  try {
    const { driver } = req.params;
    const cacheKey = `telemetry_${driver}`;
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const carData = await openF1Service.getCarData(driver);
    const telemetry = dataNormalizer.normalizeTelemetry(carData);
    
    cacheService.set(cacheKey, telemetry);
    res.json(telemetry);
  } catch (error) {
    console.error(`Error fetching telemetry for ${req.params.driver}:`, error);
    res.status(500).json({ error: 'Failed to fetch telemetry data' });
  }
});

// GET /api/positions - Live GPS coordinates
app.get('/api/positions', async (req, res) => {
  try {
    const cachedData = cacheService.get('positions');
    if (cachedData) {
      return res.json(cachedData);
    }

    const locations = await openF1Service.getLocations();
    const positions = dataNormalizer.normalizePositions(locations);
    
    cacheService.set('positions', positions);
    res.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch position data' });
  }
});

// GET /api/drivers - All drivers list
app.get('/api/drivers', async (req, res) => {
  try {
    const cachedData = cacheService.get('drivers');
    if (cachedData) {
      return res.json(cachedData);
    }

    const drivers = await openF1Service.getDrivers();
    
    cacheService.set('drivers', drivers);
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ error: 'Failed to fetch drivers data' });
  }
});

// GET /api/driver/:driverNumber - Driver-specific data
app.get('/api/driver/:driverNumber', async (req, res) => {
  try {
    const { driverNumber } = req.params;
    const cacheKey = `driver_${driverNumber}`;
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const [carData, driver, position] = await Promise.all([
      openF1Service.getCarData(driverNumber),
      openF1Service.getDriver(driverNumber),
      openF1Service.getDriverPosition(driverNumber)
    ]);

    const driverData = dataNormalizer.normalizeDriverData(carData, driver, position);
    
    cacheService.set(cacheKey, driverData);
    res.json(driverData);
  } catch (error) {
    console.error(`Error fetching driver data for ${req.params.driverNumber}:`, error);
    res.status(500).json({ error: 'Failed to fetch driver data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cache_size: cacheService.size()
  });
});

// Real-time data polling and broadcasting
async function pollAndBroadcast() {
  try {
    console.log('Polling OpenF1 API for updates...');
    
    // Fetch all data in parallel
    const [positionsData, drivers, locations] = await Promise.all([
      openF1Service.getPositions(),
      openF1Service.getDrivers(),
      openF1Service.getLocations()
    ]);

    const positions = dataNormalizer.normalizeLeaderboard(positionsData, drivers);
    const battles = dataNormalizer.detectBattles(positionsData);
    const normalizedLocations = dataNormalizer.normalizePositions(locations);

    // Update cache
    cacheService.set('leaderboard', positions);
    cacheService.set('battles', battles);
    cacheService.set('positions', normalizedLocations);
    cacheService.set('drivers', drivers);

    // Broadcast to WebSocket clients
    broadcastToClients({
      type: 'update',
      timestamp: new Date().toISOString(),
      data: {
        leaderboard: positions,
        battles: battles,
        positions: normalizedLocations,
        drivers: drivers
      }
    });

  } catch (error) {
    console.error('Error during polling:', error);
  }
}

// Start polling interval
const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL_MS) || 2000;
setInterval(pollAndBroadcast, POLLING_INTERVAL);

// Start server
server.listen(PORT, () => {
  console.log(`F1 Analytics Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Polling interval: ${POLLING_INTERVAL}ms`);
  
  // Initial data fetch
  pollAndBroadcast();
});

export default app; 