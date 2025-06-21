// Netlify Function for individual driver data
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
      // Extract driver number from path
      const pathSegments = event.path.split('/');
      const driverNumber = pathSegments[pathSegments.length - 1];

      if (!driverNumber || isNaN(driverNumber)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Invalid driver number',
            message: 'Driver number must be provided and be a valid number',
          }),
        };
      }

      const driverNum = parseInt(driverNumber);

      // Mock driver database
      const driverData = {
        1: { name: "Max Verstappen", team: "Red Bull Racing", country: "Netherlands", teamColor: "#3671C6" },
        44: { name: "Lewis Hamilton", team: "Mercedes", country: "United Kingdom", teamColor: "#27F4D2" },
        63: { name: "George Russell", team: "Mercedes", country: "United Kingdom", teamColor: "#27F4D2" },
        11: { name: "Sergio Perez", team: "Red Bull Racing", country: "Mexico", teamColor: "#3671C6" },
        55: { name: "Carlos Sainz", team: "Ferrari", country: "Spain", teamColor: "#F91536" },
        16: { name: "Charles Leclerc", team: "Ferrari", country: "Monaco", teamColor: "#F91536" },
        4: { name: "Lando Norris", team: "McLaren", country: "United Kingdom", teamColor: "#F58020" },
        81: { name: "Oscar Piastri", team: "McLaren", country: "Australia", teamColor: "#F58020" },
        14: { name: "Fernando Alonso", team: "Aston Martin", country: "Spain", teamColor: "#229971" },
        18: { name: "Lance Stroll", team: "Aston Martin", country: "Canada", teamColor: "#229971" }
      };

      const driver = driverData[driverNum] || {
        name: `Driver ${driverNum}`,
        team: "Unknown Team",
        country: "Unknown",
        teamColor: "#808080"
      };

      // Mock comprehensive driver data
      const mockDriverData = {
        driver: {
          number: driverNum,
          name: driver.name,
          team: driver.team,
          country: driver.country,
          teamColor: driver.teamColor
        },
        position: {
          current: Math.floor(Math.random() * 20) + 1,
          gap: (Math.random() * 30).toFixed(3),
          interval: (Math.random() * 5).toFixed(3)
        },
        telemetry: {
          drs: Math.random() > 0.7 ? 1 : 0,
          throttle: Math.floor(Math.random() * 100),
          brake: Math.floor(Math.random() * 30),
          speed: Math.floor(Math.random() * 50 + 250),
          gear: Math.floor(Math.random() * 8 + 1),
          rpm: Math.floor(Math.random() * 3000 + 9000)
        },
        lastUpdate: new Date().toISOString()
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          ...mockDriverData,
          message: 'Driver data from Netlify Functions'
        }),
      };
    } catch (error) {
      console.error('Error in driver function:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch driver data',
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