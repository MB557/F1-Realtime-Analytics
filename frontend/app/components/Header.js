'use client'

import { useState } from 'react'

export default function Header({ isConnected, lastUpdate, selectedDriver, onDriverSelect, drivers = [] }) {
  const [showDriverSelect, setShowDriverSelect] = useState(false)

  const selectedDriverData = drivers.find(d => d.driverNumber === selectedDriver)

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🏎️</div>
              <div className="text-xl font-bold">
                <span className="text-f1-red">F1</span>
                <span className="text-white ml-1">Analytics</span>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`status-dot ${isConnected ? 'live-indicator' : 'bg-gray-500'}`}></div>
              <span className={`text-sm font-mono ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Driver Selection and Info */}
          <div className="flex items-center space-x-4">
            {/* Selected Driver Info */}
            {selectedDriverData && (
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: selectedDriverData.teamColor }}
                ></div>
                <span className="font-mono text-sm">
                  #{selectedDriverData.driverNumber} {selectedDriverData.driverName}
                </span>
                <button
                  onClick={() => onDriverSelect(null)}
                  className="text-gray-400 hover:text-white ml-2"
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Driver Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDriverSelect(!showDriverSelect)}
                className="f1-button text-sm px-3 py-2"
              >
                Select Driver
              </button>
              
              {showDriverSelect && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs text-gray-400 mb-2">Select a driver to view detailed telemetry:</div>
                    {drivers.map((driver) => (
                      <button
                        key={driver.driverNumber}
                        onClick={() => {
                          onDriverSelect(driver.driverNumber)
                          setShowDriverSelect(false)
                        }}
                        className={`w-full flex items-center space-x-3 p-2 rounded hover:bg-gray-800 transition-colors ${
                          selectedDriver === driver.driverNumber ? 'bg-gray-800' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: driver.teamColor }}
                          ></div>
                          <span className="text-sm font-mono">#{driver.driverNumber}</span>
                          <span className="text-sm truncate">{driver.driverName}</span>
                        </div>
                        <span className="text-xs text-gray-400">P{driver.position}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Last Update Time */}
            {lastUpdate && (
              <div className="text-xs text-gray-400 font-mono">
                Last: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDriverSelect && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDriverSelect(false)}
        ></div>
      )}
    </header>
  )
} 