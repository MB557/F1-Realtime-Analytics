'use client'

import { useState, useEffect, useRef } from 'react'
import { getApiBaseUrl } from '../utils/apiConfig'

export function useWebSocket(url) {
  const [data, setData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const ws = useRef(null)
  const pollingInterval = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 3 // Reduced for faster fallback
  const isWebSocketDisabled = url === 'disabled' || url?.includes('disabled')

  // API base URL for polling fallback
  const apiBaseUrl = getApiBaseUrl()

  // Polling function to fetch data from API endpoints
  const fetchDataFromAPI = async () => {
    try {
      const [leaderboardRes, battlesRes, positionsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/leaderboard`).catch(() => ({ ok: false })),
        fetch(`${apiBaseUrl}/battles`).catch(() => ({ ok: false })),
        fetch(`${apiBaseUrl}/positions`).catch(() => ({ ok: false }))
      ])

      const leaderboard = leaderboardRes.ok ? await leaderboardRes.json() : { data: [] }
      const battles = battlesRes.ok ? await battlesRes.json() : { data: [] }
      const positions = positionsRes.ok ? await positionsRes.json() : { data: [] }

      // Format data similar to WebSocket message format
      const formattedData = {
        type: 'update',
        timestamp: new Date().toISOString(),
        data: {
          leaderboard: leaderboard.data || [],
          battles: battles.data || [],
          positions: positions.data || []
        }
      }

      setData(formattedData)
      setError(null)
    } catch (err) {
      console.error('Error fetching data from API:', err)
      setError('Failed to fetch data from API')
    }
  }

  // Start polling mode
  const startPolling = () => {
    console.log('Starting polling mode (every 5 seconds)')
    setIsPolling(true)
    setIsConnected(true) // Consider polling as "connected"
    
    // Fetch data immediately
    fetchDataFromAPI()
    
    // Set up polling interval
    pollingInterval.current = setInterval(fetchDataFromAPI, 5000)
  }

  // Stop polling mode
  const stopPolling = () => {
    console.log('Stopping polling mode')
    setIsPolling(false)
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }
  }

  // WebSocket connection function
  const connect = () => {
    // If WebSocket is disabled, go straight to polling
    if (isWebSocketDisabled) {
      console.log('WebSocket disabled, using polling mode')
      startPolling()
      return
    }

    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
        stopPolling() // Stop polling if WebSocket connects
      }

      ws.current.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          setData(parsedData)
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
          console.log(`Attempting to reconnect in ${timeout}ms...`)
          
          setTimeout(() => {
            reconnectAttempts.current += 1
            connect()
          }, timeout)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          // If WebSocket fails after max attempts, fallback to polling
          console.log('WebSocket reconnection failed, falling back to polling')
          startPolling()
        }
      }

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection error - falling back to polling')
        
        // If WebSocket fails, try polling as fallback
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          startPolling()
        }
      }

    } catch (err) {
      console.error('Error creating WebSocket connection:', err)
      setError('Failed to create WebSocket connection - using polling')
      startPolling()
    }
  }

  useEffect(() => {
    connect()

    return () => {
      // Cleanup
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting')
      }
      stopPolling()
    }
  }, [url])

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else if (isPolling) {
      console.log('Cannot send message in polling mode')
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const disconnect = () => {
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect')
    }
    stopPolling()
    setIsConnected(false)
  }

  const reconnect = () => {
    disconnect()
    reconnectAttempts.current = 0
    setTimeout(connect, 1000)
  }

  return {
    data,
    isConnected,
    isPolling,
    error,
    sendMessage,
    disconnect,
    reconnect
  }
} 