// Centralized API configuration utility
export const getApiBaseUrl = () => {
  // Check if we're in browser and on Netlify (production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    console.log('🔧 Current hostname:', hostname)
    
    // If we're on a netlify.app domain or any domain that's not localhost
    if (hostname.includes('netlify.app') || 
        (!hostname.includes('localhost') && 
         !hostname.includes('127.0.0.1') &&
         hostname !== '')) {
      console.log('🔧 Using Netlify Functions API:', '/.netlify/functions')
      return '/.netlify/functions'
    }
  }
  
  // Fallback to environment variable or localhost for development
  const fallbackUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
  console.log('🔧 Using fallback API URL:', fallbackUrl)
  return fallbackUrl
}

// Helper function to get API URL safely (only call in components)
export const getApiUrl = () => {
  // Always call getApiBaseUrl() fresh to ensure window is available
  return getApiBaseUrl()
} 