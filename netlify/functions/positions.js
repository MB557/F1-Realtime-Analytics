// Netlify Function for GPS positions/track data
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Handle GET request
  if (event.httpMethod === 'GET') {
    try {
      // Mock GPS position data for F1 drivers
      // In real implementation, this would come from OpenF1 location API
      const mockPositions = [
        {
          driverNumber: 1,
          driverName: "M. Verstappen",
          x: 0.85,
          y: 0.12,
          z: 0.0,
          lastUpdate: new Date().toISOString()
        },
        {
          driverNumber: 44,
          driverName: "L. Hamilton", 
          x: 0.82,
          y: 0.15,
          z: 0.0,
          lastUpdate: new Date().toISOString()
        },
        {
          driverNumber: 63,
          driverName: "G. Russell",
          x: 0.79,
          y: 0.18,
          z: 0.0,
          lastUpdate: new Date().toISOString()
        },
        {
          driverNumber: 11,
          driverName: "S. Perez",
          x: 0.76,
          y: 0.21,
          z: 0.0,
          lastUpdate: new Date().toISOString()
        },
        {
          driverNumber: 55,
          driverName: "C. Sainz",
          x: 0.73,
          y: 0.24,
          z: 0.0,
          lastUpdate: new Date().toISOString()
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockPositions,
          track_info: {
            name: "Demo Track",
            country: "Virtual",
            layout: "clockwise"
          },
          message: 'Position data from Netlify Functions',
          last_updated: new Date().toISOString()
        }),
      };
    } catch (error) {
      console.error('Error in positions function:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch position data',
          message: error.message,
        }),
      };
    }
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({
      error: 'Method not allowed',
      message: `${event.httpMethod} method is not supported`,
    }),
  };
}; 