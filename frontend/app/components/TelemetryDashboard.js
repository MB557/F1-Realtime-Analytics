'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { getApiUrl } from '../utils/apiConfig'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function TelemetryDashboard({ driverNumber, drivers = [] }) {
  const [telemetryHistory, setTelemetryHistory] = useState([])

  // Get API URL dynamically for each request
  const apiUrl = getApiUrl()
  
  const { data: telemetryRawData, error } = useSWR(
    driverNumber ? `${apiUrl}/telemetry/${driverNumber}` : null,
    fetcher,
    { refreshInterval: 1000 }
  )

  // Extract telemetry data from API response
  const telemetryData = telemetryRawData?.data || telemetryRawData

  const selectedDriver = Array.isArray(drivers) ? drivers.find(d => d.driverNumber === driverNumber) : null

  // Update telemetry history for mini-charts
  useEffect(() => {
    if (telemetryData) {
      setTelemetryHistory(prev => {
        const newHistory = [...prev, {
          timestamp: Date.now(),
          throttle: telemetryData.throttle || 0,
          brake: telemetryData.brake || 0,
          speed: telemetryData.speed || 0
        }]
        // Keep only last 30 data points
        return newHistory.slice(-30)
      })
    }
  }, [telemetryData])

  const TelemetryGauge = ({ value, max = 100, label, unit = '%', color = '#60A5FA' }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const strokeDasharray = `${percentage} ${100 - percentage}`
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#374151"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{Math.round(value)}</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          <div className="font-mono">{label}</div>
          <div>{unit}</div>
        </div>
      </div>
    )
  }

  const MiniChart = ({ data, color = '#60A5FA', label }) => {
    if (data.length < 2) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = ((max - value) / range) * 40 + 10
      return `${x},${y}`
    }).join(' ')
    
    return (
      <div className="bg-gray-800/30 rounded p-2">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <svg width="100%" height="60" viewBox="0 0 100 60" className="border border-gray-700 rounded">
          <polyline
            points={points}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            className="drop-shadow"
          />
        </svg>
      </div>
    )
  }

  if (!driverNumber) {
    return (
      <div className="f1-card">
        <div className="f1-card-header">
          📊 Telemetry Dashboard
        </div>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">🎯</div>
          <div>Select a driver to view telemetry</div>
          <div className="text-sm mt-1">Real-time car data</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="f1-card">
        <div className="f1-card-header">
          📊 Telemetry Dashboard
        </div>
        <div className="text-center text-red-400 py-8">
          <div className="text-4xl mb-2">⚠️</div>
          <div>Telemetry data unavailable</div>
          <div className="text-sm mt-1">Check connection</div>
        </div>
      </div>
    )
  }

  if (!telemetryData) {
    return (
      <div className="f1-card">
        <div className="f1-card-header">
          📊 Telemetry Dashboard
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="f1-card">
      <div className="f1-card-header">
        📊 Telemetry Dashboard
        {selectedDriver && (
          <div className="ml-auto flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedDriver.teamColor }}
            ></div>
            <span className="text-sm font-normal">
              #{driverNumber} {selectedDriver.driverName}
            </span>
          </div>
        )}
      </div>

      {/* Main Telemetry Gauges */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <TelemetryGauge
          value={telemetryData.throttle || 0}
          label="Throttle"
          color="#22C55E"
        />
        <TelemetryGauge
          value={telemetryData.brake || 0}
          label="Brake"
          color="#EF4444"
        />
        <TelemetryGauge
          value={telemetryData.speed || 0}
          max={350}
          label="Speed"
          unit="km/h"
          color="#F59E0B"
        />
      </div>

      {/* Additional Data */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800/30 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">DRS</span>
            <div className={`px-2 py-1 rounded text-xs font-bold ${
              telemetryData.drs ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              {telemetryData.drs ? 'OPEN' : 'CLOSED'}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Gear</span>
            <span className="text-lg font-bold font-mono">
              {telemetryData.gear || 'N'}
            </span>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">RPM</span>
            <span className="text-lg font-bold font-mono">
              {telemetryData.rpm ? `${Math.round(telemetryData.rpm)}` : '0'}
            </span>
          </div>
        </div>

        <div className="bg-gray-800/30 rounded p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Status</span>
            <div className="flex items-center space-x-1">
              <div className="status-dot live-indicator"></div>
              <span className="text-xs font-mono text-green-400">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Charts */}
      {telemetryHistory.length > 5 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300">Historical Data (30s)</div>
          <div className="grid grid-cols-1 gap-3">
            <MiniChart
              data={telemetryHistory.map(d => d.throttle)}
              color="#22C55E"
              label="Throttle %"
            />
            <MiniChart
              data={telemetryHistory.map(d => d.speed)}
              color="#F59E0B"
              label="Speed km/h"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Last update: {new Date(telemetryData.lastUpdate).toLocaleTimeString()}</span>
          <span>1Hz refresh rate</span>
        </div>
      </div>
    </div>
  )
} 