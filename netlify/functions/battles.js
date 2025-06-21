// Netlify Function for battle detection
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
      // For now, return mock battle data
      // In a real implementation, this would analyze position data
      const mockBattles = [
        {
          id: "44_63",
          leadingDriver: { 
            driverNumber: 44, 
            driverName: "L. Hamilton",
            position: 3 
          },
          chasingDriver: { 
            driverNumber: 63, 
            driverName: "G. Russell",
            position: 4 
          },
          gap: 0.847,
          intensity: "high",
          lastUpdate: new Date().toISOString()
        },
        {
          id: "1_11",
          leadingDriver: { 
            driverNumber: 1, 
            driverName: "M. Verstappen",
            position: 1 
          },
          chasingDriver: { 
            driverNumber: 11, 
            driverName: "S. Perez",
            position: 2 
          },
          gap: 1.234,
          intensity: "medium",
          lastUpdate: new Date().toISOString()
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockBattles,
          message: 'Battle data from Netlify Functions',
          last_updated: new Date().toISOString()
        }),
      };
    } catch (error) {
      console.error('Error in battles function:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch battle data',
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