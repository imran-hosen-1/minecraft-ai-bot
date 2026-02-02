# Elite Combat Guard Bot - Quick Reference

## 🎮 User Commands

### Basic Control
```
help           - Show all available commands
status         - Display bot status and statistics
stop / stay    - Stop all activities
```

### Guard Modes
```
guard          - Guard current location
bodyguard      - Follow and protect you
follow         - Alias for bodyguard
follow me      - Alias for bodyguard
patrol <coords>- Patrol between waypoints (admin only)
```

### Combat Commands
```
fight          - Initiate PvP combat with you
fight me       - Alias for fight
attack         - Alias for fight
attack me      - Alias for attack
peace          - End hostilities
friendly       - Alias for peace
hostile        - List all hostile players
clearall       - Clear all hostile players (admin only)
```

### Advanced Commands (Admin Only)
```
stats          - Show detailed session statistics
mode <type>    - Set combat mode (aggressive/defensive/balanced)
risk <0-1>     - Set risk tolerance (0=cautious, 1=reckless)
learn reset    - Reset learning data
```

---

## 🤖 Bot Features Overview

### Core Systems

#### ✅ Combat Management
- **Predictive AI**: Predicts enemy movement 6-8 ticks ahead
- **Multi-Target**: Engages up to 5 simultaneous targets
- **Weapon Switching**: Auto-switches between melee and ranged
- **Critical Hits**: Optimized jump attacks for 85%+ crit rate
- **Combo System**: Chains attacks for maximum DPS
- **Strafe Combat**: Moves unpredictably while fighting

#### 🎯 Threat Assessment
- **Dynamic Calculation**: Real-time threat evaluation
- **Historical Tracking**: Remembers dangerous entities
- **Equipment Analysis**: Assesses player gear
- **Velocity Tracking**: Monitors movement speed
- **Priority Targeting**: Focuses highest threats first

#### 🧠 Learning System
- **Experience Tracking**: Records encounters per entity type
- **Strategy Adaptation**: Learns preferred combat approaches
- **Win/Loss Analysis**: Tracks success rates
- **Session Statistics**: Monitors performance metrics
- **Pattern Recognition**: Identifies enemy behavior patterns

#### 🎯 Goal Tracking
- **Priority Management**: Handles multiple objectives
- **Success Tracking**: Records goal completion rates
- **Dynamic Priorities**: Adjusts based on situation
- **Performance Analytics**: Measures goal efficiency

#### 🏃 Movement & Navigation
- **Advanced Pathfinding**: A* algorithm with obstacle avoidance
- **Parkour Enabled**: Jumps gaps and climbs obstacles
- **Sprint Optimization**: Uses sprinting strategically
- **Safe Path Preference**: Avoids dangerous routes
- **Trap Avoidance**: Detects and navigates around traps

#### 🛡️ Defensive Systems
- **Projectile Dodge**: Evades arrows and other projectiles
- **Escape System**: Retreats when health is critical
- **Kiting Manager**: Maintains optimal combat distance
- **Cover Finding**: Uses environment for protection
- **High Ground Seeking**: Takes tactical positions

#### 📦 Resource Management
- **Auto-Resupply**: Finds and uses nearby chests
- **Smart Crafting**: Auto-crafts needed items
- **Inventory Optimization**: Manages inventory efficiently
- **Potion Usage**: Uses potions in combat
- **Durability Monitoring**: Tracks equipment condition

#### 🔍 Trap Detection
- **Pattern Recognition**: Identifies trap configurations
- **Pressure Plate Detection**: Spots trigger mechanisms
- **TNT Scanning**: Locates explosive traps
- **Lava Trap Detection**: Finds liquid hazards
- **Avoidance System**: Navigates around dangers

---

## ⚙️ Configuration Reference

### Combat Settings
```javascript
combat: {
  maxChaseDistance: 32,          // Max pursuit range
  scanRadius: 20,                // Detection radius
  attackCooldown: 450,           // Time between attacks (ms)
  predictionTicks: 8,            // Movement prediction lookahead
  predictionSamples: 5,          // Samples for prediction
  adaptivePrediction: true,      // Learn movement patterns
  
  kiteDistance: {
    melee: 4.0,                  // Melee kiting distance
    ranged: 10,                  // Ranged kiting distance
    danger: 12,                  // Danger zone distance
    swarm: 15                    // Multi-enemy distance
  },
  
  maxSimultaneousTargets: 5,     // Max concurrent targets
  targetSwitchCooldown: 1500,    // Target switch delay (ms)
  
  escapeHealthThreshold: 7,      // Flee below this health
  escapeMobCountThreshold: 5,    // Flee if 5+ enemies
  
  strafeEnabled: true,           // Strafe while fighting
  autoSwitchWeapons: true,       // Auto weapon selection
  comboEnabled: true,            // Enable combo attacks
  criticalHitChance: 0.85        // Target crit rate
}
```

### AI Settings
```javascript
ai: {
  goalPriorities: {
    survival: 100,               // Highest priority
    combat: 90,                  // Combat priority
    guard: 70,                   // Guard duty priority
    gather: 50,                  // Resource gathering
    idle: 20                     // Idle activities
  },
  
  enableLearning: true,          // Enable AI learning
  learningRate: 0.1,             // How fast to learn
  experienceDecay: 0.95,         // Experience decay rate
  
  threatCalculation: 'dynamic',  // 'static' or 'dynamic'
  threatUpdateInterval: 500,     // Update frequency (ms)
  
  riskTolerance: 0.4,            // Risk taking (0-1)
  aggressiveness: 0.7            // Combat style (0-1)
}
```

### Resource Management
```javascript
resources: {
  minFoodLevel: 14,              // Eat threshold
  minArrowCount: 32,             // Minimum arrows
  criticalArrowCount: 8,         // Critical low arrows
  
  weaponDurabilityThreshold: 0.20,
  armorDurabilityThreshold: 0.25,
  toolDurabilityThreshold: 0.15,
  
  autoResupply: true,            // Auto find supplies
  resupplyDistance: 48,          // Search radius
  resupplyChests: true,          // Use chests
  craftingEnabled: true,         // Auto-craft items
  
  usePotionsInCombat: true,      // Use potions
  healthThresholdForPotion: 10   // Potion use threshold
}
```

### Pathfinding Settings
```javascript
pathfinding: {
  allowFreeMotion: false,
  allowSwimming: true,
  allowFalling: true,
  maxFallDistance: 4,
  allowParkour: true,
  allowSprinting: true,
  avoidHostileMobs: true,
  avoidWater: false,
  avoidLava: true,
  preferSafePaths: true
}
```

---

## 📊 Statistics & Metrics

### Combat Statistics
```
Kills               - Total enemy kills
Deaths              - Times bot has died
K/D Ratio           - Kill/Death ratio
Hits                - Successful attacks landed
Misses              - Failed attack attempts
Damage Dealt        - Total damage output
Damage Taken        - Total damage received
```

### Learning Metrics
```
Encounters          - Total combat encounters
Win Rate            - Win percentage per entity type
Avg Duration        - Average fight duration
Preferred Strategy  - Learned optimal approach
Dodge Success Rate  - Successful dodge percentage
```

### Goal Tracking
```
Active Goals        - Current objectives
Completed Goals     - Successfully finished
Failed Goals        - Unsuccessful attempts
Success Rate        - Overall completion rate
Avg Goal Time       - Average completion duration
```

### Threat Assessment
```
Current Threats     - Active hostile entities
Highest Threat      - Most dangerous target
Threat History      - Entities that damaged bot
Threat Level        - Calculated danger score
```

---

## 🎯 Combat Modes Explained

### Aggressive Mode
- **Style**: Maximum offense, direct assault
- **Best For**: When bot has health/equipment advantage
- **Tactics**: 
  - Rush targets directly
  - Focus on DPS
  - Minimal defensive moves
  - Continuous pressure
- **Use When**: Facing weak or few enemies

### Defensive Mode
- **Style**: Kiting, strategic retreat
- **Best For**: Low health or outnumbered
- **Tactics**:
  - Maintain distance
  - Use ranged attacks
  - Retreat when threatened
  - Prioritize survival
- **Use When**: Low health or many enemies

### Balanced Mode (Default)
- **Style**: Adaptive, context-aware
- **Best For**: Most situations
- **Tactics**:
  - Mix of offense/defense
  - Adapts to situation
  - Uses best strategy
  - Considers health/enemies
- **Use When**: General combat

---

## 🔧 Performance Tuning

### For Better Performance
```javascript
performance: {
  maxTickRate: 20,               // Lower for slower systems
  entityUpdateInterval: 100,     // Increase to reduce CPU
  cleanupInterval: 60000,        // Memory cleanup frequency
  maxMemoryMB: 512,              // Memory limit
  logLevel: 'warn'               // Reduce log verbosity
}
```

### For Better Combat
```javascript
combat: {
  predictionTicks: 10,           // More prediction
  predictionSamples: 7,          // More samples
  attackCooldown: 400,           // Faster attacks
  strafeEnabled: true,           // Harder to hit
  adaptivePrediction: true       // Learn patterns
}
```

### For Better Learning
```javascript
ai: {
  enableLearning: true,
  learningRate: 0.15,            // Learn faster
  experienceDecay: 0.9,          // Remember longer
  threatUpdateInterval: 250      // Update more often
}
```

---

## 🚨 Troubleshooting

### Bot Won't Attack
**Possible Causes:**
1. No hostile players added (use `fight` command)
2. Target out of scan radius
3. Pathfinding blocked
4. No weapon equipped

**Solutions:**
1. Use `fight` or `attack` command first
2. Increase `scanRadius` in config
3. Check for obstacles
4. Ensure bot has weapons in inventory

### Bot Keeps Dying
**Possible Causes:**
1. Too aggressive (low `riskTolerance`)
2. Not escaping at low health
3. Outnumbered
4. Poor equipment

**Solutions:**
1. Set mode to `defensive`
2. Increase `escapeHealthThreshold`
3. Decrease `maxSimultaneousTargets`
4. Provide better armor/weapons

### Bot Not Following
**Possible Causes:**
1. Pathfinding issues
2. Target too far
3. Combat mode active

**Solutions:**
1. Use `stop` then `follow` again
2. Move closer to bot
3. End combat with `peace`

### High CPU Usage
**Solutions:**
1. Increase `entityUpdateInterval`
2. Lower `maxTickRate`
3. Set `logLevel` to 'error'
4. Reduce `scanRadius`
5. Disable `adaptivePrediction`

### Bot Getting Stuck
**Solutions:**
1. Use `stop` command
2. Check pathfinding settings
3. Enable `allowParkour`
4. Increase `maxFallDistance`
5. Check for terrain bugs

---

## 🎓 Pro Tips

### Combat Excellence
1. **Use High Ground**: Bot automatically seeks tactical positions
2. **Manage Ammunition**: Keep arrows stocked for ranged combat
3. **Learn From Failures**: Bot adapts strategies over time
4. **Set Appropriate Modes**: Use aggressive for easy fights, defensive when outnumbered
5. **Monitor Health**: Bot will auto-escape at low health

### Resource Optimization
1. **Keep Chests Nearby**: Bot can resupply automatically
2. **Stock Potions**: Healing potions used in combat
3. **Maintain Equipment**: Bot monitors durability
4. **Enable Auto-Craft**: Bot will craft needed items
5. **Organize Storage**: Bot can find items faster

### Strategic Positioning
1. **Guard Key Locations**: Use `guard` at important spots
2. **Patrol Routes**: Set up patrol paths with waypoints
3. **Use Bodyguard Mode**: Bot stays close and protects you
4. **Combine Modes**: Switch between guard/bodyguard as needed

### Learning System
1. **Let Bot Learn**: More fights = better strategies
2. **Review Stats**: Use `stats` to see improvements
3. **Reset If Needed**: Use `learn reset` for fresh start
4. **Try Different Modes**: Help bot learn various strategies
5. **Monitor Win Rates**: Check which strategies work best

---

## 📋 Checklist for New Users

### Initial Setup
- [ ] Install all required npm packages
- [ ] Configure server details (host, port, username)
- [ ] Set whitelist (if needed)
- [ ] Configure combat parameters
- [ ] Test with `help` command

### First Deployment
- [ ] Verify bot can connect to server
- [ ] Test basic movement (`guard`, `follow`)
- [ ] Test combat (`fight` with permission)
- [ ] Check status with `status` command
- [ ] Monitor console for errors

### Ongoing Maintenance
- [ ] Check stats regularly
- [ ] Monitor resource levels
- [ ] Review learning progress
- [ ] Adjust configuration as needed
- [ ] Update plugins when available

---

## 🆘 Getting Help

### Debug Mode
Enable detailed logging:
```javascript
performance: {
  logLevel: 'debug'  // Shows all operations
}
```

### Check System Status
```
status     - Basic info
stats      - Detailed metrics (admin)
```

### Common Error Messages

**"No weapon equipped"**
→ Provide weapons in inventory

**"Pathfinding failed"**
→ Check for obstacles or increase maxFallDistance

**"Target lost"**
→ Target moved out of range or died

**"Low resources"**
→ Resupply arrows/food/potions

**"Escape triggered"**
→ Health too low, bot retreating

---

## 📚 Additional Resources

### Code Examples
- See `combat_guard_enhanced.js` for implementation
- See `ENHANCEMENT_GUIDE.md` for detailed features
- See `PLUGIN_INTEGRATION_GUIDE.md` for plugins

### Community
- Mineflayer Discord
- GitHub Issues
- PrismJS Community

### Documentation
- [Mineflayer API](https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md)
- [Pathfinder Guide](https://github.com/PrismarineJS/mineflayer-pathfinder)
- [Node.js Docs](https://nodejs.org/en/docs/)

---

**Version**: 2.0 Enhanced Edition  
**Last Updated**: 2025  
**Compatibility**: Minecraft 1.16+ (1.20.4 recommended)

---

🤖 **Elite Combat Guard Bot** - Your AI-Powered Minecraft Guardian
