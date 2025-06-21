'use client'

import { useState, useEffect } from 'react'

export default function TrackMiniMap({ positions = [], drivers = [], selectedDriver }) {
  const [mapBounds, setMapBounds] = useState({ minX: 0, maxX: 100, minY: 0, maxY: 100 })
  const [showDriverNumbers, setShowDriverNumbers] = useState(true)

  // Calculate map bounds from position data
  useEffect(() => {
    if (positions.length > 0) {
      const xCoords = positions.map(p => p.x).filter(x => x !== 0)
      const yCoords = positions.map(p => p.y).filter(y => y !== 0)
      
      if (xCoords.length > 0 && yCoords.length > 0) {
        const minX = Math.min(...xCoords)
        const maxX = Math.max(...xCoords)
        const minY = Math.min(...yCoords)
        const maxY = Math.max(...yCoords)
        
        // Add padding
        const paddingX = (maxX - minX) * 0.1
        const paddingY = (maxY - minY) * 0.1
        
        setMapBounds({
          minX: minX - paddingX,
          maxX: maxX + paddingX,
          minY: minY - paddingY,
          maxY: maxY + paddingY
        })
      }
    }
  }, [positions])

  const getDriverInfo = (driverNumber) => {
    return drivers.find(d => d.driverNumber === driverNumber) || {
      driverName: `Driver ${driverNumber}`,
      teamColor: '#CCCCCC',
      position: '?'
    }
  }

  const normalizePosition = (x, y) => {
    const { minX, maxX, minY, maxY } = mapBounds
    const rangeX = maxX - minX || 1
    const rangeY = maxY - minY || 1
    
    return {
      x: ((x - minX) / rangeX) * 100,
      y: ((y - minY) / rangeY) * 100
    }
  }

  const DriverDot = ({ position, driver, isSelected }) => {
    const { x, y } = normalizePosition(position.x, position.y)
    
    return (
      <g>
        {/* Driver position dot */}
        <circle
          cx={x}
          cy={y}
          r={isSelected ? 6 : 4}
          fill={driver.teamColor}
          stroke={isSelected ? '#ffffff' : 'none'}
          strokeWidth={isSelected ? 2 : 0}
          className={`transition-all duration-300 ${isSelected ? 'animate-pulse-fast' : ''}`}
        />
        
        {/* Driver number */}
        {showDriverNumbers && (
          <text
            x={x}
            y={y - 8}
            textAnchor="middle"
            className="text-xs font-bold fill-white"
            style={{ fontSize: '8px' }}
          >
            {driver.position}
          </text>
        )}
        
        {/* Direction indicator (simplified) */}
        <circle
          cx={x + 1}
          cy={y - 1}
          r={1}
          fill="rgba(255,255,255,0.7)"
          className="animate-pulse"
        />
      </g>
    )
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="f1-card">
        <div className="f1-card-header">
          🗺️ Track Mini-Map
        </div>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">📍</div>
          <div>No position data available</div>
          <div className="text-sm mt-1">GPS coordinates required</div>
        </div>
      </div>
    )
  }

  return (
    <div className="f1-card">
      <div className="f1-card-header">
        🗺️ Track Mini-Map
        <div className="ml-auto flex items-center space-x-2">
          <button
            onClick={() => setShowDriverNumbers(!showDriverNumbers)}
            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
          >
            {showDriverNumbers ? 'Hide' : 'Show'} Numbers
          </button>
          <span className="text-sm font-normal text-gray-400">
            {positions.length} cars
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <svg
          width="100%"
          height="300"
          viewBox="0 0 100 100"
          className="border border-gray-600 rounded bg-gray-800"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Track outline (simplified) */}
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            fill="none"
            stroke="#4B5563"
            strokeWidth="0.5"
            strokeDasharray="2,2"
            opacity="0.5"
          />
          
          {/* Start/Finish line */}
          <line
            x1="50"
            y1="2"
            x2="50"
            y2="8"
            stroke="#22C55E"
            strokeWidth="1"
          />
          <text
            x="50"
            y="15"
            textAnchor="middle"
            className="text-xs fill-green-400"
            style={{ fontSize: '6px' }}
          >
            S/F
          </text>

          {/* Render driver positions */}
          {positions.map((position) => {
            const driver = getDriverInfo(position.driverNumber)
            const isSelected = selectedDriver === position.driverNumber
            
            return (
              <DriverDot
                key={position.driverNumber}
                position={position}
                driver={driver}
                isSelected={isSelected}
              />
            )
          })}
        </svg>
      </div>

      {/* Position Legend */}
      <div className="mt-4 max-h-32 overflow-y-auto">
        <div className="text-sm font-medium text-gray-300 mb-2">Driver Positions</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {positions
            .map(pos => ({ ...pos, driver: getDriverInfo(pos.driverNumber) }))
            .sort((a, b) => parseInt(a.driver.position) - parseInt(b.driver.position))
            .slice(0, 10) // Show top 10
            .map(({ driverNumber, driver }) => (
              <div
                key={driverNumber}
                className={`flex items-center space-x-2 p-1 rounded ${
                  selectedDriver === driverNumber ? 'bg-gray-700/50' : ''
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: driver.teamColor }}
                ></div>
                <span className="font-mono text-gray-400">P{driver.position}</span>
                <span className="truncate">{driver.driverName}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Start/Finish</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Live Position</span>
            </div>
          </div>
          <span>Real-time GPS</span>
        </div>
      </div>

      {/* Selected Driver Info */}
      {selectedDriver && (
        <div className="mt-3 p-3 bg-gray-800/50 rounded border border-gray-600">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getDriverInfo(selectedDriver).teamColor }}
            ></div>
            <span className="font-mono text-sm">
              #{selectedDriver} {getDriverInfo(selectedDriver).driverName}
            </span>
            <span className="ml-auto text-xs text-gray-400">
              Position: {getDriverInfo(selectedDriver).position}
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 