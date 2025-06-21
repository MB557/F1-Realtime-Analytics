'use client'

export default function BattlePanel({ battles = [], drivers = [] }) {
  const getDriverInfo = (driverNumber) => {
    return drivers.find(d => d.driverNumber === driverNumber) || {
      driverName: `Driver ${driverNumber}`,
      teamColor: '#CCCCCC'
    }
  }

  const getBattleIntensityClass = (intensity) => {
    switch (intensity) {
      case 'very-high': return 'bg-battle-very-high'
      case 'high': return 'bg-battle-high'
      case 'medium': return 'bg-battle-medium'
      case 'low': return 'bg-battle-low'
      default: return 'bg-gray-500'
    }
  }

  const getBattleIntensityText = (intensity) => {
    switch (intensity) {
      case 'very-high': return '🔥 INTENSE'
      case 'high': return '⚡ HIGH'
      case 'medium': return '🟡 MEDIUM'
      case 'low': return '🟢 LOW'
      default: return '⚪ UNKNOWN'
    }
  }

  if (!battles || battles.length === 0) {
    return (
      <div className="f1-card">
        <div className="f1-card-header">
          ⚔️ Battle Detection
        </div>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">🏁</div>
          <div>No active battles detected</div>
          <div className="text-sm mt-1">Drivers need to be within 1.0s</div>
        </div>
      </div>
    )
  }

  return (
    <div className="f1-card">
      <div className="f1-card-header">
        ⚔️ Battle Detection
        <span className="ml-auto text-sm font-normal text-gray-400">
          {battles.length} active
        </span>
      </div>
      
      <div className="space-y-3">
        {battles.map((battle) => {
          const leadingDriver = getDriverInfo(battle.leadingDriver.driverNumber)
          const chasingDriver = getDriverInfo(battle.chasingDriver.driverNumber)
          
          return (
            <div
              key={battle.id}
              className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30 hover:bg-gray-800/50 transition-colors"
            >
              {/* Battle Intensity Header */}
              <div className="flex items-center justify-between mb-3">
                <div className={`battle-indicator ${getBattleIntensityClass(battle.intensity)} text-white`}>
                  {getBattleIntensityText(battle.intensity)}
                </div>
                <div className="font-mono text-sm text-gray-400">
                  Gap: {battle.gap.toFixed(3)}s
                </div>
              </div>

              {/* Driver Comparison */}
              <div className="space-y-2">
                {/* Leading Driver */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: leadingDriver.teamColor }}
                    ></div>
                    <span className="font-mono text-sm text-gray-400">
                      P{battle.leadingDriver.position}
                    </span>
                    <span className="font-medium">
                      {leadingDriver.driverName}
                    </span>
                  </div>
                  <div className="text-sm text-green-400 font-mono">AHEAD</div>
                </div>

                {/* VS Divider */}
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-px bg-gray-600"></div>
                  <span className="text-xs text-gray-500 font-bold">VS</span>
                  <div className="flex-1 h-px bg-gray-600"></div>
                </div>

                {/* Chasing Driver */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: chasingDriver.teamColor }}
                    ></div>
                    <span className="font-mono text-sm text-gray-400">
                      P{battle.chasingDriver.position}
                    </span>
                    <span className="font-medium">
                      {chasingDriver.driverName}
                    </span>
                  </div>
                  <div className="text-sm text-orange-400 font-mono">CHASE</div>
                </div>
              </div>

              {/* Battle Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Proximity</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getBattleIntensityClass(battle.intensity)}`}
                      style={{ width: `${Math.max(10, 100 - (battle.gap * 100))}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {(battle.gap * 1000).toFixed(0)}ms
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Battles within 1.0s gap</span>
          <span>Real-time detection</span>
        </div>
      </div>
    </div>
  )
} 