// Centralized API configuration utility
export const getApiBaseUrl = () => {
  // Check if we're in browser and on Netlify (production)
  if (typeof window !== 'undefined') {
    // If we're on a netlify.app domain or any domain that's not localhost
    if (window.location.hostname.includes('netlify.app') || 
        (!window.location.hostname.includes('localhost') && 
         !window.location.hostname.includes('127.0.0.1'))) {
      console.log('🔧 Using Netlify Functions API:', '/.netlify/functions')
      return '/.netlify/functions'
    }
  }
  
  // Fallback to environment variable or localhost for development
  const fallbackUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
  console.log('🔧 Using fallback API URL:', fallbackUrl)
  return fallbackUrl
}

// Export a ready-to-use API URL
export const API_BASE_URL = getApiBaseUrl() 