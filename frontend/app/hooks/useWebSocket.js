'use client'

import { useState, useEffect, useRef } from 'react'

export function useWebSocket(url) {
  const [data, setData] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const ws = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = () => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
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
        }
      }

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('WebSocket connection error')
      }

    } catch (err) {
      console.error('Error creating WebSocket connection:', err)
      setError('Failed to create WebSocket connection')
    }
  }

  useEffect(() => {
    connect()

    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting')
      }
    }
  }, [url])

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const disconnect = () => {
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect')
    }
  }

  const reconnect = () => {
    disconnect()
    reconnectAttempts.current = 0
    setTimeout(connect, 1000)
  }

  return {
    data,
    isConnected,
    error,
    sendMessage,
    disconnect,
    reconnect
  }
} 