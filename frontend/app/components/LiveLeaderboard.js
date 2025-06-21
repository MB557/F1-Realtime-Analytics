'use client'

import { useState, useEffect } from 'react'

export default function LiveLeaderboard({ data = [], onDriverSelect, selectedDriver }) {
  const [previousData, setPreviousData] = useState([])
  const [changedPositions, setChangedPositions] = useState(new Set())

  useEffect(() => {
    if (data.length > 0 && previousData.length > 0) {
      const changed = new Set()
      
      data.forEach(currentDriver => {
        const previousDriver = previousData.find(p => p.driverNumber === currentDriver.driverNumber)
        if (previousDriver && previousDriver.position !== currentDriver.position) {
          changed.add(currentDriver.driverNumber)
        }
      })
      
      setChangedPositions(changed)
      
      // Clear the highlight after 2 seconds
      const timer = setTimeout(() => {
        setChangedPositions(new Set())
      }, 2000)
      
      return () => clearTimeout(timer)
    }
    
    setPreviousData(data)
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div className="f1-card">
        <div className="f1-card-header">
          🏁 Live Leaderboard
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
        🏁 Live Leaderboard
        <span className="ml-auto text-sm font-normal text-gray-400">
          {data.length} drivers
        </span>
      </div>
      
      <div className="space-y-1">
        {data.map((driver, index) => (
          <div
            key={driver.driverNumber}
            className={`driver-position cursor-pointer ${
              selectedDriver === driver.driverNumber ? 'bg-gray-700/50' : ''
            } ${
              changedPositions.has(driver.driverNumber) ? 'data-update-flash' : ''
            }`}
            onClick={() => onDriverSelect(driver.driverNumber)}
          >
            {/* Team Color Bar */}
            <div 
              className="team-color-bar absolute left-0 top-0 bottom-0"
              style={{ backgroundColor: driver.teamColor }}
            ></div>

            <div className="flex items-center space-x-3 ml-2">
              {/* Position */}
              <div className="w-8 text-center">
                <span className={`font-bold ${
                  driver.position === 1 ? 'text-yellow-400' :
                  driver.position === 2 ? 'text-gray-300' :
                  driver.position === 3 ? 'text-amber-600' :
                  'text-white'
                }`}>
                  {driver.isRetired ? 'OUT' : driver.position}
                </span>
              </div>

              {/* Driver Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm text-gray-400">
                    #{driver.driverNumber}
                  </span>
                  <span className="font-medium truncate">
                    {driver.driverName}
                  </span>
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {driver.teamName}
                </div>
              </div>

              {/* Timing */}
              <div className="text-right min-w-0 flex-shrink-0">
                {!driver.isRetired && (
                  <>
                    <div className="font-mono text-sm">
                      {driver.position === 1 ? (
                        <span className="text-green-400">Leader</span>
                      ) : (
                        <span>+{driver.gap}s</span>
                      )}
                    </div>
                    {driver.position > 1 && (
                      <div className="font-mono text-xs text-gray-400">
                        +{driver.interval}s
                      </div>
                    )}
                  </>
                )}
                {driver.isRetired && (
                  <div className="text-xs text-red-400">RETIRED</div>
                )}
              </div>
            </div>

            {/* Position Change Indicator */}
            {changedPositions.has(driver.driverNumber) && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="text-xs text-yellow-400 animate-pulse">📈</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer with additional info */}
      <div className="mt-4 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Click driver to view telemetry</span>
          <span>Live timing</span>
        </div>
      </div>
    </div>
  )
} 