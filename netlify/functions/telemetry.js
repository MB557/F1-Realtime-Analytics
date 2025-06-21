// Netlify Function for driver telemetry data
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

      // Mock telemetry data based on driver number
      const mockTelemetry = {
        driverNumber: parseInt(driverNumber),
        drs: Math.random() > 0.7 ? 1 : 0,
        throttle: Math.floor(Math.random() * 100),
        brake: Math.floor(Math.random() * 30),
        speed: Math.floor(Math.random() * 50 + 250), // 250-300 km/h
        gear: Math.floor(Math.random() * 8 + 1), // 1-8
        rpm: Math.floor(Math.random() * 3000 + 9000), // 9000-12000 RPM
        lastUpdate: new Date().toISOString()
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockTelemetry,
          message: 'Telemetry data from Netlify Functions',
          last_updated: new Date().toISOString()
        }),
      };
    } catch (error) {
      console.error('Error in telemetry function:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch telemetry data',
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