// Import the OpenF1 service
const https = require('https');

// OpenF1 API base URL
const OPENF1_API_BASE_URL = 'https://api.openf1.org/v1';

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Get current session
async function getCurrentSession() {
  try {
    const response = await makeRequest(`${OPENF1_API_BASE_URL}/sessions?session_type=Race&year=2024`);
    return response && response.length > 0 ? response[0] : null;
  } catch (error) {
    console.error('Error fetching current session:', error);
    return null;
  }
}

// Get position data
async function getPositionData(sessionKey) {
  try {
    const response = await makeRequest(`${OPENF1_API_BASE_URL}/position?session_key=${sessionKey}`);
    return response || [];
  } catch (error) {
    console.error('Error fetching position data:', error);
    return [];
  }
}

// Normalize leaderboard data
function normalizeLeaderboard(positionData) {
  if (!positionData || positionData.length === 0) {
    return [];
  }

  // Group by driver and get latest position for each
  const driverPositions = {};
  positionData.forEach(entry => {
    if (!driverPositions[entry.driver_number] || 
        new Date(entry.date) > new Date(driverPositions[entry.driver_number].date)) {
      driverPositions[entry.driver_number] = entry;
    }
  });

  // Convert to leaderboard format
  return Object.values(driverPositions)
    .map(entry => ({
      position: entry.position,
      driverNumber: entry.driver_number,
      driverName: `Driver ${entry.driver_number}`, // Would need driver data for full names
      teamName: 'Unknown Team', // Would need team data
      teamColor: '#808080', // Default color
      gap: '0.000', // Would need gap calculation
      interval: '0.000', // Would need interval calculation
      lastUpdate: entry.date,
      isRetired: false
    }))
    .sort((a, b) => a.position - b.position);
}

// Netlify Function handler
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
      // Get current session
      const session = await getCurrentSession();
      if (!session) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            data: [],
            message: 'No active F1 session found',
            last_updated: new Date().toISOString()
          }),
        };
      }

      // Get position data
      const positionData = await getPositionData(session.session_key);
      
      // Normalize the data
      const leaderboard = normalizeLeaderboard(positionData);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: leaderboard,
          session_info: {
            session_name: session.session_name,
            session_type: session.session_type,
            location: session.location,
            country_name: session.country_name,
          },
          last_updated: new Date().toISOString()
        }),
      };
    } catch (error) {
      console.error('Error in leaderboard function:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch leaderboard data',
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