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
      // For demo purposes, return mock leaderboard data
      // In production, this would fetch from OpenF1 API
      const mockLeaderboard = [
        {
          position: 1,
          driverNumber: 1,
          driverName: "M. Verstappen",
          teamName: "Red Bull Racing",
          teamColor: "#3671C6",
          gap: "0.000",
          interval: "0.000",
          lastUpdate: new Date().toISOString(),
          isRetired: false
        },
        {
          position: 2,
          driverNumber: 44,
          driverName: "L. Hamilton",
          teamName: "Mercedes",
          teamColor: "#27F4D2",
          gap: "+8.234",
          interval: "+8.234",
          lastUpdate: new Date().toISOString(),
          isRetired: false
        },
        {
          position: 3,
          driverNumber: 63,
          driverName: "G. Russell",
          teamName: "Mercedes",
          teamColor: "#27F4D2",
          gap: "+12.847",
          interval: "+4.613",
          lastUpdate: new Date().toISOString(),
          isRetired: false
        },
        {
          position: 4,
          driverNumber: 11,
          driverName: "S. Perez",
          teamName: "Red Bull Racing",
          teamColor: "#3671C6",
          gap: "+15.234",
          interval: "+2.387",
          lastUpdate: new Date().toISOString(),
          isRetired: false
        },
        {
          position: 5,
          driverNumber: 55,
          driverName: "C. Sainz",
          teamName: "Ferrari",
          teamColor: "#F91536",
          gap: "+18.567",
          interval: "+3.333",
          lastUpdate: new Date().toISOString(),
          isRetired: false
        },
        {
          position: 6,
          driverNumber: 16,
          driverName: "C. Leclerc", 
          teamName: "Ferrari",
          teamColor: "#F91536",
          gap: "+22.123",
          interval: "+3.556",
          lastUpdate: new Date().toISOString(),
          isRetired: false
        },
        {
          position: 7,
          driverNumber: 4,
          driverName: "L. Norris",
          teamName: "McLaren",
          teamColor: "#F58020",
          gap: "+25.789",
          interval: "+3.666",
          lastUpdate: new Date().toISOString(),
          isRetired: false
        },
        {
          position: 8,
          driverNumber: 81,
          driverName: "O. Piastri",
          teamName: "McLaren", 
          teamColor: "#F58020",
          gap: "+28.456",
          interval: "+2.667",
          lastUpdate: new Date().toISOString(),
          isRetired: false
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockLeaderboard,
          session_info: {
            session_name: "Demo Race",
            session_type: "Race",
            location: "Virtual Circuit",
            country_name: "Demo Land",
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