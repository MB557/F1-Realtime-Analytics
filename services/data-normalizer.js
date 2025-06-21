export class DataNormalizer {
  constructor() {
    this.teamColors = {
      'Red Bull Racing': '#3671C6',
      'Mercedes': '#27F4D2',
      'Ferrari': '#E8002D',
      'McLaren': '#FF8000',
      'Alpine': '#0093CC',
      'Aston Martin': '#229971',
      'AlphaTauri': '#5E8FAA',
      'Alfa Romeo': '#C92D4B',
      'Haas': '#B6BABD',
      'Williams': '#37BEDD'
    };
  }

  /**
   * Normalize leaderboard data combining positions and driver info
   */
  normalizeLeaderboard(positions, drivers = []) {
    if (!positions || !Array.isArray(positions)) {
      return [];
    }

    // Get the latest position for each driver
    const latestPositions = this.getLatestDataPerDriver(positions);
    
    return latestPositions.map(position => {
      const driver = drivers.find(d => d.driver_number === position.driver_number) || {};
      
      return {
        position: position.position,
        driverNumber: position.driver_number,
        driverName: this.formatDriverName(driver),
        teamName: driver.team_name || 'Unknown',
        teamColor: this.getTeamColor(driver.team_name),
        gap: this.formatGap(position.gap_to_leader),
        interval: this.formatGap(position.interval),
        lastUpdate: position.date,
        isRetired: position.position === null || position.position === 0
      };
    }).sort((a, b) => {
      // Handle retired drivers (position null/0)
      if (a.isRetired && !b.isRetired) return 1;
      if (!a.isRetired && b.isRetired) return -1;
      if (a.isRetired && b.isRetired) return a.driverNumber - b.driverNumber;
      
      return a.position - b.position;
    });
  }

  /**
   * Detect battles (drivers within 1 second of each other)
   */
  detectBattles(positions) {
    if (!positions || !Array.isArray(positions)) {
      return [];
    }

    const latestPositions = this.getLatestDataPerDriver(positions);
    const battles = [];

    // Sort by position
    const sortedPositions = latestPositions
      .filter(p => p.position && p.position > 0)
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < sortedPositions.length - 1; i++) {
      const current = sortedPositions[i];
      const next = sortedPositions[i + 1];

      // Check if interval is within 1 second
      const interval = parseFloat(next.interval) || 0;
      if (interval <= 1.0 && interval > 0) {
        battles.push({
          id: `${current.driver_number}_${next.driver_number}`,
          leadingDriver: {
            driverNumber: current.driver_number,
            position: current.position
          },
          chasingDriver: {
            driverNumber: next.driver_number,
            position: next.position
          },
          gap: interval,
          intensity: this.calculateBattleIntensity(interval),
          lastUpdate: new Date().toISOString()
        });
      }
    }

    return battles;
  }

  /**
   * Normalize telemetry data for a specific driver
   */
  normalizeTelemetry(carData) {
    if (!carData || !Array.isArray(carData)) {
      return {
        drs: null,
        throttle: null,
        brake: null,
        speed: null,
        gear: null,
        rpm: null,
        lastUpdate: null
      };
    }

    // Get the most recent telemetry data
    const latest = carData[carData.length - 1] || {};
    
    return {
      drs: latest.drs || 0,
      throttle: this.normalizePercentage(latest.throttle),
      brake: this.normalizePercentage(latest.brake),
      speed: latest.speed || 0,
      gear: latest.n_gear || 0,
      rpm: latest.rpm || 0,
      lastUpdate: latest.date || new Date().toISOString(),
      raw: latest // Include raw data for debugging
    };
  }

  /**
   * Normalize GPS position data
   */
  normalizePositions(locations) {
    if (!locations || !Array.isArray(locations)) {
      return [];
    }

    const latestLocations = this.getLatestDataPerDriver(locations);
    
    return latestLocations.map(location => ({
      driverNumber: location.driver_number,
      x: location.x || 0,
      y: location.y || 0,
      z: location.z || 0,
      lastUpdate: location.date,
      isValid: !!(location.x && location.y)
    })).filter(pos => pos.isValid);
  }

  /**
   * Normalize comprehensive driver data
   */
  normalizeDriverData(carData, driver, position) {
    return {
      driver: {
        number: driver?.driver_number || 0,
        name: this.formatDriverName(driver),
        team: driver?.team_name || 'Unknown',
        teamColor: this.getTeamColor(driver?.team_name),
        country: driver?.country_code || 'Unknown'
      },
      position: {
        current: position?.position || 0,
        gap: this.formatGap(position?.gap_to_leader),
        interval: this.formatGap(position?.interval)
      },
      telemetry: this.normalizeTelemetry(carData),
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Get the latest data point for each driver from a dataset
   */
  getLatestDataPerDriver(data) {
    if (!Array.isArray(data)) return [];
    
    const driverMap = new Map();
    
    data.forEach(item => {
      const driverNumber = item.driver_number;
      const currentDate = new Date(item.date).getTime();
      
      if (!driverMap.has(driverNumber) || 
          new Date(driverMap.get(driverNumber).date).getTime() < currentDate) {
        driverMap.set(driverNumber, item);
      }
    });
    
    return Array.from(driverMap.values());
  }

  /**
   * Format driver name from driver object
   */
  formatDriverName(driver) {
    if (!driver) return 'Unknown';
    
    if (driver.name_acronym) {
      return driver.name_acronym;
    }
    
    if (driver.first_name && driver.last_name) {
      return `${driver.first_name.charAt(0)}. ${driver.last_name}`;
    }
    
    if (driver.full_name) {
      return driver.full_name;
    }
    
    return `Driver ${driver.driver_number || '?'}`;
  }

  /**
   * Get team color for visualization
   */
  getTeamColor(teamName) {
    if (!teamName) return '#CCCCCC';
    
    // Try exact match first
    if (this.teamColors[teamName]) {
      return this.teamColors[teamName];
    }
    
    // Try partial match
    for (const [team, color] of Object.entries(this.teamColors)) {
      if (teamName.includes(team) || team.includes(teamName)) {
        return color;
      }
    }
    
    // Return a hash-based color for unknown teams
    return this.generateColorFromString(teamName);
  }

  /**
   * Format gap/interval times
   */
  formatGap(gap) {
    if (gap === null || gap === undefined) return '-';
    if (gap === 0) return '0.000';
    
    const numGap = parseFloat(gap);
    if (isNaN(numGap)) return '-';
    
    return numGap.toFixed(3);
  }

  /**
   * Normalize percentage values (0-100)
   */
  normalizePercentage(value) {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
  }

  /**
   * Calculate battle intensity based on gap
   */
  calculateBattleIntensity(gap) {
    if (gap <= 0.2) return 'very-high';
    if (gap <= 0.5) return 'high';
    if (gap <= 0.8) return 'medium';
    return 'low';
  }

  /**
   * Generate a consistent color from a string
   */
  generateColorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  /**
   * Normalize lap time data
   */
  normalizeLapTimes(laps) {
    if (!laps || !Array.isArray(laps)) {
      return [];
    }

    return laps.map(lap => ({
      driverNumber: lap.driver_number,
      lapNumber: lap.lap_number,
      lapTime: lap.lap_duration ? this.formatLapTime(lap.lap_duration) : null,
      sector1: lap.duration_sector_1 ? this.formatLapTime(lap.duration_sector_1) : null,
      sector2: lap.duration_sector_2 ? this.formatLapTime(lap.duration_sector_2) : null,
      sector3: lap.duration_sector_3 ? this.formatLapTime(lap.duration_sector_3) : null,
      isPersonalBest: lap.is_pit_out_lap === false && lap.lap_duration > 0,
      isPitLap: lap.is_pit_out_lap === true,
      lastUpdate: lap.date_start
    }));
  }

  /**
   * Format lap time from seconds to MM:SS.mmm
   */
  formatLapTime(seconds) {
    if (!seconds || seconds <= 0) return null;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toFixed(3).padStart(6, '0')}`;
  }
} 