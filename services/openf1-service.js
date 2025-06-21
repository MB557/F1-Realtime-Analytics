import fetch from 'node-fetch';

export class OpenF1DataService {
  constructor() {
    this.baseUrl = process.env.OPENF1_API_BASE_URL || 'https://api.openf1.org/v1';
    this.currentSession = null;
    this.mockMode = process.env.MOCK_DATA === 'true';
    this.mockStartTime = Date.now();
    this.mockDrivers = this.generateMockDrivers();
  }

  /**
   * Generate mock drivers for testing
   */
  generateMockDrivers() {
    return [
      { driver_number: 1, name_acronym: 'VER', full_name: 'Max Verstappen', team_name: 'Red Bull Racing', team_colour: '#0600EF' },
      { driver_number: 11, name_acronym: 'PER', full_name: 'Sergio Pérez', team_name: 'Red Bull Racing', team_colour: '#0600EF' },
      { driver_number: 44, name_acronym: 'HAM', full_name: 'Lewis Hamilton', team_name: 'Mercedes', team_colour: '#00D2BE' },
      { driver_number: 63, name_acronym: 'RUS', full_name: 'George Russell', team_name: 'Mercedes', team_colour: '#00D2BE' },
      { driver_number: 16, name_acronym: 'LEC', full_name: 'Charles Leclerc', team_name: 'Ferrari', team_colour: '#DC0000' },
      { driver_number: 55, name_acronym: 'SAI', full_name: 'Carlos Sainz Jr.', team_name: 'Ferrari', team_colour: '#DC0000' },
      { driver_number: 4, name_acronym: 'NOR', full_name: 'Lando Norris', team_name: 'McLaren', team_colour: '#FF9500' },
      { driver_number: 81, name_acronym: 'PIA', full_name: 'Oscar Piastri', team_name: 'McLaren', team_colour: '#FF9500' },
      { driver_number: 14, name_acronym: 'ALO', full_name: 'Fernando Alonso', team_name: 'Aston Martin', team_colour: '#006F62' },
      { driver_number: 18, name_acronym: 'STR', full_name: 'Lance Stroll', team_name: 'Aston Martin', team_colour: '#006F62' }
    ];
  }

  /**
   * Generate mock session data
   */
  getMockSession() {
    return {
      session_key: 9999,
      session_name: 'Race',
      date_start: new Date().toISOString(),
      date_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      gmt_offset: '+00:00',
      session_type: 'Race',
      location: 'Monaco',
      country_name: 'Monaco',
      circuit_short_name: 'Monaco'
    };
  }

  /**
   * Generate mock positions with realistic race dynamics
   */
  getMockPositions() {
    const elapsed = (Date.now() - this.mockStartTime) / 1000;
    
    return this.mockDrivers.map((driver, index) => {
      const baseGap = index * 1.8;
      const variation = Math.sin(elapsed / 15 + index) * 0.8;
      const gap = Math.max(0, baseGap + variation);
      
      return {
        driver_number: driver.driver_number,
        date: new Date().toISOString(),
        position: index + 1,
        gap_to_leader: gap.toFixed(3),
        interval: index === 0 ? null : (Math.random() * 2 + 0.5).toFixed(3)
      };
    });
  }

  /**
   * Generate mock car telemetry data
   */
  getMockCarData(driverNumber) {
    const elapsed = (Date.now() - this.mockStartTime) / 1000;
    const driverIndex = this.mockDrivers.findIndex(d => d.driver_number === parseInt(driverNumber));
    const offset = driverIndex * 0.5;
    
    const throttleBase = 60 + Math.sin(elapsed / 8 + offset) * 35;
    const brakeBase = Math.max(0, 25 + Math.cos(elapsed / 6 + offset) * 20);
    const speedBase = 200 + Math.sin(elapsed / 10 + offset) * 80;
    
    return [{
      driver_number: parseInt(driverNumber),
      date: new Date().toISOString(),
      rpm: Math.floor(9000 + Math.sin(elapsed / 4 + offset) * 2500),
      speed: Math.floor(Math.max(50, speedBase)),
      n_gear: Math.max(1, Math.min(8, Math.floor(speedBase / 35))),
      throttle: Math.floor(Math.max(0, Math.min(100, throttleBase))),
      brake: Math.floor(Math.max(0, Math.min(100, brakeBase))),
      drs: Math.sin(elapsed / 12 + offset) > 0.3 ? 1 : 0
    }];
  }

  /**
   * Generate mock GPS locations (circular track)
   */
  getMockLocations() {
    const elapsed = (Date.now() - this.mockStartTime) / 1000;
    
    return this.mockDrivers.map((driver, index) => {
      const progress = ((elapsed / 20) + (index * 0.05)) % 1;
      const angle = progress * 2 * Math.PI;
      
      return {
        driver_number: driver.driver_number,
        date: new Date().toISOString(),
        x: Math.cos(angle) * 400 + 500,
        y: Math.sin(angle) * 250 + 400,
        z: 15 + Math.sin(angle * 2) * 8
      };
    });
  }

  /**
   * Get the current session information
   */
  async getCurrentSession() {
    if (this.mockMode) {
      console.log('🏎️ Mock Mode: Simulating live F1 session');
      return this.getMockSession();
    }

    if (this.currentSession) {
      return this.currentSession;
    }

    try {
      const response = await fetch(`${this.baseUrl}/sessions?date_start>=2024-01-01&order=-date_start&limit=1`);
      const sessions = await response.json();
      
      if (sessions && sessions.length > 0) {
        this.currentSession = sessions[0];
        return this.currentSession;
      }
    } catch (error) {
      console.error('Error fetching current session:', error);
    }
    
    return null;
  }

  /**
   * Get current driver positions
   */
  async getPositions() {
    if (this.mockMode) {
      return this.getMockPositions();
    }

    try {
      const session = await this.getCurrentSession();
      if (!session) {
        console.warn('No current session found');
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/position?session_key=${session.session_key}&date>=${this.getRecentTimestamp()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const positions = await response.json();
      return Array.isArray(positions) ? positions : [];
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }

  /**
   * Get all drivers information
   */
  async getDrivers() {
    if (this.mockMode) {
      return this.mockDrivers;
    }

    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return [];
      }

      const response = await fetch(`${this.baseUrl}/drivers?session_key=${session.session_key}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const drivers = await response.json();
      return Array.isArray(drivers) ? drivers : [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  }

  /**
   * Get specific driver information
   */
  async getDriver(driverNumber) {
    try {
      const drivers = await this.getDrivers();
      return drivers.find(driver => driver.driver_number.toString() === driverNumber.toString());
    } catch (error) {
      console.error(`Error fetching driver ${driverNumber}:`, error);
      return null;
    }
  }

  /**
   * Get car telemetry data for a specific driver
   */
  async getCarData(driverNumber) {
    if (this.mockMode) {
      return this.getMockCarData(driverNumber);
    }

    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/car_data?session_key=${session.session_key}&driver_number=${driverNumber}&date>=${this.getRecentTimestamp()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const carData = await response.json();
      return Array.isArray(carData) ? carData : [];
    } catch (error) {
      console.error(`Error fetching car data for driver ${driverNumber}:`, error);
      return [];
    }
  }

  /**
   * Get GPS location data
   */
  async getLocations() {
    if (this.mockMode) {
      return this.getMockLocations();
    }

    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/location?session_key=${session.session_key}&date>=${this.getRecentTimestamp()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const locations = await response.json();
      return Array.isArray(locations) ? locations : [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  /**
   * Get driver position information
   */
  async getDriverPosition(driverNumber) {
    try {
      const positions = await this.getPositions();
      return positions.find(pos => pos.driver_number.toString() === driverNumber.toString());
    } catch (error) {
      console.error(`Error fetching position for driver ${driverNumber}:`, error);
      return null;
    }
  }

  /**
   * Get lap times data
   */
  async getLaps() {
    if (this.mockMode) {
      return []; // Mock lap data not implemented for simplicity
    }

    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/laps?session_key=${session.session_key}&date>=${this.getRecentTimestamp()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const laps = await response.json();
      return Array.isArray(laps) ? laps : [];
    } catch (error) {
      console.error('Error fetching laps:', error);
      return [];
    }
  }

  /**
   * Get intervals data (gaps between drivers)
   */
  async getIntervals() {
    if (this.mockMode) {
      return []; // Mock interval data not implemented for simplicity
    }

    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return [];
      }

      const response = await fetch(
        `${this.baseUrl}/intervals?session_key=${session.session_key}&date>=${this.getRecentTimestamp()}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const intervals = await response.json();
      return Array.isArray(intervals) ? intervals : [];
    } catch (error) {
      console.error('Error fetching intervals:', error);
      return [];
    }
  }

  /**
   * Get pit stops data
   */
  async getPitStops() {
    if (this.mockMode) {
      return []; // Mock pit stop data not implemented for simplicity
    }

    try {
      const session = await this.getCurrentSession();
      if (!session) {
        return [];
      }

      const response = await fetch(`${this.baseUrl}/pit?session_key=${session.session_key}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pitStops = await response.json();
      return Array.isArray(pitStops) ? pitStops : [];
    } catch (error) {
      console.error('Error fetching pit stops:', error);
      return [];
    }
  }

  /**
   * Get recent timestamp for filtering recent data (last 30 seconds)
   */
  getRecentTimestamp() {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30000);
    return thirtySecondsAgo.toISOString().replace('Z', '+00:00');
  }

  /**
   * Clear cached session data (useful for testing or when session changes)
   */
  clearSession() {
    this.currentSession = null;
  }
} 