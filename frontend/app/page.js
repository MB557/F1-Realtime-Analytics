'use client'

import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import useSWR from 'swr'
import Header from './components/Header'
import LiveLeaderboard from './components/LiveLeaderboard'
import BattlePanel from './components/BattlePanel'
import TelemetryDashboard from './components/TelemetryDashboard'
import TrackMiniMap from './components/TrackMiniMap'
import LoadingSpinner from './components/LoadingSpinner'

const fetcher = (url) => fetch(url).then((res) => res.json())

// Get API base URL with proper fallback for Netlify
const getApiBaseUrl = () => {
  // Check if we're in browser and on Netlify (production)
  if (typeof window !== 'undefined') {
    // If we're on a netlify.app domain or custom domain (not localhost)
    if (window.location.hostname.includes('netlify.app') || 
        !window.location.hostname.includes('localhost')) {
      return '/.netlify/functions'
    }
  }
  // Fallback to environment variable or localhost
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
}

export default function Dashboard() {
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:3001')

  // Set API base URL when component mounts
  useEffect(() => {
    setApiBaseUrl(getApiBaseUrl())
    console.log('🔧 API Base URL:', getApiBaseUrl()) // Debug log
  }, [])

  // WebSocket connection for real-time updates
  const { data: wsData, isConnected: wsConnected } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002'
  )

  // SWR for initial data and fallback
  const { data: leaderboardData, error: leaderboardError } = useSWR(
    `${apiBaseUrl}/leaderboard`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const { data: battlesData, error: battlesError } = useSWR(
    `${apiBaseUrl}/battles`,
    fetcher,
    { refreshInterval: 3000 }
  )

  const { data: positionsData, error: positionsError } = useSWR(
    `${apiBaseUrl}/positions`,
    fetcher,
    { refreshInterval: 2000 }
  )

  // Update connection status
  useEffect(() => {
    setIsConnected(wsConnected)
  }, [wsConnected])

  // Handle WebSocket data updates
  useEffect(() => {
    if (wsData && wsData.type === 'update') {
      setLastUpdate(new Date(wsData.timestamp))
    }
  }, [wsData])

  // Get current data (WebSocket takes priority over SWR)
  const currentLeaderboard = wsData?.data?.leaderboard || leaderboardData || []
  const currentBattles = wsData?.data?.battles || battlesData || []
  const currentPositions = wsData?.data?.positions || positionsData || []

  if (leaderboardError || battlesError || positionsError) {
    console.error('🔴 API Errors:', {
      leaderboardError,
      battlesError,
      positionsError,
      apiBaseUrl
    })
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️ Connection Error</div>
          <div className="text-gray-400 mb-4">
            Unable to connect to F1 Analytics API.
          </div>
          <div className="text-xs text-gray-500 bg-gray-800 p-3 rounded mb-4">
            <div><strong>API URL:</strong> {apiBaseUrl}</div>
                         <div><strong>Trying:</strong> {apiBaseUrl}/leaderboard</div>
            {leaderboardError && (
              <div><strong>Error:</strong> {leaderboardError.message}</div>
            )}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="f1-button text-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header 
        isConnected={isConnected} 
        lastUpdate={lastUpdate}
        selectedDriver={selectedDriver}
        onDriverSelect={setSelectedDriver}
        drivers={currentLeaderboard}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Leaderboard */}
          <div className="lg:col-span-1">
            <LiveLeaderboard 
              data={currentLeaderboard}
              onDriverSelect={setSelectedDriver}
              selectedDriver={selectedDriver}
            />
          </div>

          {/* Middle Column - Battles and Telemetry */}
          <div className="lg:col-span-1 space-y-6">
            <BattlePanel 
              battles={currentBattles}
              drivers={currentLeaderboard}
            />
            
            <TelemetryDashboard 
              driverNumber={selectedDriver}
              drivers={currentLeaderboard}
            />
          </div>

          {/* Right Column - Track Map */}
          <div className="lg:col-span-1">
            <TrackMiniMap 
              positions={currentPositions}
              drivers={currentLeaderboard}
              selectedDriver={selectedDriver}
            />
          </div>
        </div>

        {/* Full-width section for additional panels */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Additional panels can be added here */}
          <div className="f1-card">
            <div className="f1-card-header">
              📊 Session Statistics
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Active Drivers:</span>
                <span className="font-mono">{currentLeaderboard.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Battles:</span>
                <span className="font-mono">{currentBattles.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Connection Status:</span>
                <span className={`font-mono ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              {lastUpdate && (
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span className="font-mono text-xs">
                    {lastUpdate.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="f1-card">
            <div className="f1-card-header">
              🎯 Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className="f1-button text-sm py-2"
                onClick={() => window.location.reload()}
              >
                Refresh Data
              </button>
              <button 
                className="f1-button text-sm py-2"
                onClick={() => setSelectedDriver(null)}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 