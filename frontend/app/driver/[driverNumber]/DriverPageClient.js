'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import Header from '../../components/Header'
import TelemetryDashboard from '../../components/TelemetryDashboard'
import LoadingSpinner from '../../components/LoadingSpinner'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function DriverPageClient({ driverNumber }) {
  const { data: driverData, error: driverError } = useSWR(
    driverNumber ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/driver/${driverNumber}` : null,
    fetcher,
    { refreshInterval: 2000 }
  )

  const { data: leaderboardData } = useSWR(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leaderboard`,
    fetcher,
    { refreshInterval: 5000 }
  )

  if (driverError) {
    return (
      <div className="min-h-screen">
        <Header isConnected={false} drivers={[]} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️ Driver Not Found</div>
            <div className="text-gray-400 mb-4">
              Could not load data for driver #{driverNumber}
            </div>
            <Link href="/" className="f1-button">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!driverData) {
    return (
      <div className="min-h-screen">
        <Header isConnected={false} drivers={[]} />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="large" className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header 
        isConnected={true} 
        drivers={leaderboardData || []}
        selectedDriver={parseInt(driverNumber)}
      />
      
      <main className="container mx-auto px-4 py-6">
        {/* Driver Header */}
        <div className="f1-card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: driverData.driver.teamColor }}
              ></div>
              <div>
                <h1 className="text-2xl font-bold">
                  #{driverData.driver.number} {driverData.driver.name}
                </h1>
                <div className="text-gray-400">
                  {driverData.driver.team} • {driverData.driver.country}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">P{driverData.position.current}</div>
              <div className="text-sm text-gray-400">
                {driverData.position.current === 1 ? 'Leader' : `+${driverData.position.gap}s`}
              </div>
            </div>
          </div>
        </div>

        {/* Driver Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="f1-card">
            <div className="f1-card-header">🏆 Position</div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">P{driverData.position.current}</div>
              <div className="text-sm text-gray-400">
                Gap: {driverData.position.gap}s
              </div>
              <div className="text-sm text-gray-400">
                Interval: {driverData.position.interval}s
              </div>
            </div>
          </div>

          <div className="f1-card">
            <div className="f1-card-header">🏎️ Current Speed</div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {driverData.telemetry.speed || 0}
              </div>
              <div className="text-sm text-gray-400">km/h</div>
            </div>
          </div>

          <div className="f1-card">
            <div className="f1-card-header">⚙️ Current Gear</div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {driverData.telemetry.gear || 'N'}
              </div>
              <div className="text-sm text-gray-400">Gear</div>
            </div>
          </div>
        </div>

        {/* Detailed Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TelemetryDashboard 
            driverNumber={parseInt(driverNumber)}
            drivers={leaderboardData || []}
          />
          
          <div className="f1-card">
            <div className="f1-card-header">📈 Performance Metrics</div>
            
            <div className="space-y-4">
              {/* Throttle vs Brake Balance */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Throttle</span>
                  <span>{driverData.telemetry.throttle || 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${driverData.telemetry.throttle || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Brake</span>
                  <span>{driverData.telemetry.brake || 0}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${driverData.telemetry.brake || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* DRS Status */}
              <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                <span>DRS Status</span>
                <div className={`px-3 py-1 rounded font-bold text-sm ${
                  driverData.telemetry.drs ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {driverData.telemetry.drs ? 'OPEN' : 'CLOSED'}
                </div>
              </div>

              {/* RPM */}
              <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                <span>Engine RPM</span>
                <span className="font-mono text-lg">
                  {driverData.telemetry.rpm ? Math.round(driverData.telemetry.rpm).toLocaleString() : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="f1-button">
            ← Back to Main Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
} 