# 🏎️ Real-Time F1 Race Analytics Platform

A comprehensive Formula 1 analytics platform that provides real-time race data, telemetry, battle detection, and live position tracking using the OpenF1 API.

## 🎬 Demo

### 🖼️ GIF Demo
![F1 Analytics Demo](./assets/f1-analytics-demo-hq.gif)

> **Watch the F1 Analytics Platform in action!** This demo showcases the real-time dashboard with live leaderboard, battle detection, telemetry data, and track positioning - all updating in real-time during an F1 session.

### 🎯 Key Features Shown:
- **Live Leaderboard** with real-time position updates
- **Battle Detection** highlighting close racing action  
- **Telemetry Dashboard** with DRS, throttle, and brake data
- **Track Mini-Map** showing driver positions
- **Real-time WebSocket Updates** every 2 seconds

## ✨ Features

### Backend (Node.js + Express)
- **Real-time Data Fetching**: WebSocket and polling integration with OpenF1 API
- **RESTful API Endpoints**:
  - `GET /api/leaderboard` - Live race standings
  - `GET /api/battles` - Battle detection (drivers within 1s)
  - `GET /api/telemetry/:driver` - Car telemetry data (DRS, throttle, brake)
  - `GET /api/positions` - Live GPS coordinates
  - `GET /api/driver/:driverNumber` - Comprehensive driver data
- **Data Normalization**: Standardized data format from OpenF1 API
- **In-memory Caching**: Fast telemetry lookup with TTL support
- **WebSocket Broadcasting**: Real-time updates to connected clients

### Frontend (Next.js + Tailwind CSS)
- **Live Leaderboard Panel**: Driver positions, gaps, and team colors
- **Battle Detection Panel**: Real-time battles between drivers
- **Telemetry Dashboard**: Interactive gauges for DRS, throttle, brake, speed
- **Track Mini-Map**: GPS-based real-time driver positions
- **Driver-Specific Views**: Detailed dashboard per driver (`/driver/[number]`)
- **Real-time Updates**: WebSocket client with SWR fallback
- **Responsive Design**: Modern F1-themed UI with animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Internet connection (for OpenF1 API)

### 1. Backend Setup

```bash
# Install backend dependencies
npm install

# Copy environment configuration
cp env.example .env

# Start the backend server
npm run dev
```

The backend will run on:
- **API Server**: http://localhost:3001
- **WebSocket Server**: ws://localhost:3002

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## 📁 Project Structure

```
f1-analytics-platform/
├── 📂 backend/
│   ├── server.js                 # Main Express server
│   ├── package.json             # Backend dependencies
│   ├── services/
│   │   ├── openf1-service.js    # OpenF1 API integration
│   │   ├── cache-service.js     # In-memory caching
│   │   └── data-normalizer.js   # Data transformation
│   └── env.example              # Environment variables template
├── 📂 frontend/
│   ├── app/
│   │   ├── layout.js            # Root layout
│   │   ├── page.js              # Main dashboard
│   │   ├── globals.css          # Global styles + Tailwind
│   │   ├── components/
│   │   │   ├── Header.js        # Navigation header
│   │   │   ├── LiveLeaderboard.js    # Race standings
│   │   │   ├── BattlePanel.js        # Battle detection
│   │   │   ├── TelemetryDashboard.js # Car telemetry
│   │   │   ├── TrackMiniMap.js       # GPS positions
│   │   │   └── LoadingSpinner.js     # Loading component
│   │   ├── hooks/
│   │   │   └── useWebSocket.js       # WebSocket hook
│   │   └── driver/[driverNumber]/
│   │       └── page.js               # Driver-specific view
│   ├── package.json             # Frontend dependencies
│   ├── next.config.js           # Next.js configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   └── postcss.config.js        # PostCSS configuration
└── README.md                    # This file
```

## 🔧 Configuration

### Backend Environment Variables (.env)

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# OpenF1 API Configuration
OPENF1_API_BASE_URL=https://api.openf1.org/v1
POLLING_INTERVAL_MS=2000

# WebSocket Configuration
WS_PORT=3002

# Frontend Configuration (for CORS)
FRONTEND_URL=http://localhost:3000

# Cache Configuration
CACHE_TTL_SECONDS=30
MAX_CACHE_SIZE=1000
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

## 🎯 API Endpoints

### Backend REST API

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/health` | GET | Health check | Server status |
| `/api/leaderboard` | GET | Live race standings | Driver positions with gaps |
| `/api/battles` | GET | Active battles | Drivers within 1s proximity |
| `/api/telemetry/:driver` | GET | Car telemetry | DRS, throttle, brake, speed |
| `/api/positions` | GET | GPS coordinates | Real-time track positions |
| `/api/driver/:number` | GET | Driver details | Comprehensive driver data |

### WebSocket Events

```javascript
// WebSocket message format
{
  "type": "update",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "leaderboard": [...],
    "battles": [...],
    "positions": [...]
  }
}
```

## 🎨 UI Components

### Live Leaderboard
- Real-time driver positions
- Team color coding
- Gap and interval timing
- Position change animations
- Click-to-select driver functionality

### Battle Detection
- Proximity-based battle identification
- Intensity levels (Very High, High, Medium, Low)
- Visual battle indicators
- Real-time gap monitoring

### Telemetry Dashboard
- Circular progress gauges
- DRS status indicator
- Historical data charts
- Real-time performance metrics

### Track Mini-Map
- SVG-based track visualization
- Real-time GPS plotting
- Driver position indicators
- Interactive controls

## 🔌 OpenF1 API Integration

This platform integrates with the [OpenF1 API](https://openf1.org/) to fetch:

- **Session Data**: Current F1 session information
- **Position Data**: Real-time driver standings
- **Car Data**: Telemetry including throttle, brake, DRS, speed
- **Location Data**: GPS coordinates for track positioning
- **Driver Data**: Driver information and metadata

### Data Flow

1. **Backend Polling**: Fetches data from OpenF1 API every 2 seconds
2. **Data Normalization**: Standardizes and enhances raw API data
3. **Caching**: Stores processed data with TTL for performance
4. **WebSocket Broadcasting**: Pushes updates to connected frontends
5. **Frontend Updates**: Real-time UI updates via WebSocket + SWR

## 🚀 Deployment

### Backend Deployment

```bash
# Production build
npm run start

# Or with PM2
pm2 start server.js --name "f1-analytics-backend"
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start

# Or deploy to Vercel/Netlify
```

### Environment Setup

For production, ensure:
- Set `NODE_ENV=production`
- Update `FRONTEND_URL` to production domain
- Configure proper CORS settings
- Set up proper error monitoring

## 🛠️ Development

### Backend Development

```bash
# Run with nodemon (auto-restart)
npm run dev

# Run with logs
npm start
```

### Frontend Development

```bash
# Development mode with hot reload
npm run dev

# Build and preview
npm run build && npm run start
```

### Code Quality

```bash
# Frontend linting
cd frontend && npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

## 📊 Data Models

### Leaderboard Entry
```javascript
{
  position: 1,
  driverNumber: 44,
  driverName: "L. Hamilton",
  teamName: "Mercedes",
  teamColor: "#27F4D2",
  gap: "0.000",
  interval: "0.000",
  lastUpdate: "2024-01-01T12:00:00Z",
  isRetired: false
}
```

### Battle Detection
```javascript
{
  id: "44_63",
  leadingDriver: { driverNumber: 44, position: 1 },
  chasingDriver: { driverNumber: 63, position: 2 },
  gap: 0.847,
  intensity: "high",
  lastUpdate: "2024-01-01T12:00:00Z"
}
```

### Telemetry Data
```javascript
{
  drs: 1,
  throttle: 98.5,
  brake: 0.0,
  speed: 314,
  gear: 8,
  rpm: 11500,
  lastUpdate: "2024-01-01T12:00:00Z"
}
```

---

**Built with ❤️ for Formula 1 fans and developers** 
