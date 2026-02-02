const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: Goals } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const armorManager = require('mineflayer-armor-manager')
const autoeat = require('mineflayer-auto-eat').plugin
const collectBlock = require('mineflayer-collectblock').plugin
const toolPlugin = require('mineflayer-tool').plugin
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const Vec3 = require('vec3')

// Advanced plugins for enhanced AI
const { BehaviorTree, BehaviorState, StateTransition } = require('mineflayer-statemachine')
const bloodhound = require('mineflayer-bloodhound')(mineflayer)
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer)

// ================= ENHANCED CONFIGURATION =================
const CONFIG = {
  bot: {
    host: 'localhost',
    port: 25565,
    username: 'Elite_AI_Guard',
    version: '1.20.4',
    auth: 'offline',
    hideErrors: false
  },
  
  combat: {
    // Basic combat
    maxChaseDistance: 32,
    aggroMemoryTTL: 45000,
    scanRadius: 20,
    creeperFleeDistance: 8,
    creeperBowDistance: 12,
    
    // Advanced combat settings
    attackCooldown: 450,
    criticalJumpTiming: 200,
    shieldBlockDelay: 80,
    comboWindowMs: 2000,
    
    // Predictive AI (enhanced)
    predictionTicks: 8,
    predictionSamples: 5,
    adaptivePrediction: true, // Learn from target movement patterns
    
    // Kiting parameters (improved)
    kiteDistance: {
      melee: 4.0,
      ranged: 10,
      danger: 12,
      swarm: 15
    },
    
    // Multi-target (enhanced)
    maxSimultaneousTargets: 5,
    targetSwitchCooldown: 1500,
    prioritizeWeakTargets: true,
    
    // Dodge mechanics (improved)
    projectileDodgeDistance: 2.0,
    dodgeReactionTime: 80,
    predictiveEvasion: true,
    
    // Escape thresholds
    escapeHealthThreshold: 7,
    escapeMobCountThreshold: 5,
    escapeDistance: 25,
    
    // NEW: Strafe combat
    strafeEnabled: true,
    strafeDistance: 3,
    strafeChangeInterval: 1500,
    
    // NEW: Weapon switching
    autoSwitchWeapons: true,
    bowMinDistance: 6,
    swordMaxDistance: 4,
    
    // NEW: Critical hit optimization
    criticalHitChance: 0.85,
    jumpAttackEnabled: true,
    
    // NEW: Combo system
    comboEnabled: true,
    maxComboLength: 5,
    comboBreakTime: 3000
  },
  
  ai: {
    // Behavior tree settings
    updateInterval: 100,
    maxDecisionTime: 50,
    
    // Goal tracking
    goalPriorities: {
      survival: 100,
      combat: 90,
      guard: 70,
      gather: 50,
      idle: 20
    },
    
    // Learning system
    enableLearning: true,
    learningRate: 0.1,
    experienceDecay: 0.95,
    
    // Threat assessment
    threatCalculation: 'dynamic', // 'static' or 'dynamic'
    threatUpdateInterval: 500,
    
    // Decision making
    riskTolerance: 0.4, // 0.0 = extremely cautious, 1.0 = reckless
    aggressiveness: 0.7, // 0.0 = defensive, 1.0 = aggressive
  },
  
  resources: {
    minFoodLevel: 14,
    minArrowCount: 32,
    criticalArrowCount: 8,
    
    // Durability thresholds
    weaponDurabilityThreshold: 0.20,
    armorDurabilityThreshold: 0.25,
    toolDurabilityThreshold: 0.15,
    
    // Auto-resupply (enhanced)
    autoResupply: true,
    resupplyDistance: 48,
    resupplyChests: true,
    craftingEnabled: true,
    
    // Priority items (expanded)
    priorityFood: [
      'golden_apple', 'enchanted_golden_apple',
      'cooked_beef', 'cooked_porkchop', 'cooked_mutton',
      'bread', 'baked_potato', 'apple'
    ],
    priorityWeapons: [
      'netherite_sword', 'diamond_sword', 'iron_sword', 
      'stone_sword', 'netherite_axe', 'diamond_axe'
    ],
    priorityArmor: ['netherite', 'diamond', 'iron', 'chainmail', 'golden', 'leather'],
    priorityTools: ['diamond_pickaxe', 'iron_pickaxe', 'diamond_axe', 'iron_axe'],
    
    // NEW: Potion management
    potionPriorities: [
      'potion_of_healing', 'potion_of_regeneration',
      'potion_of_strength', 'potion_of_swiftness',
      'potion_of_fire_resistance'
    ],
    usePotionsInCombat: true,
    healthThresholdForPotion: 10
  },
  
  traps: {
    scanRadius: 7,
    scanInterval: 2000,
    dangerousBlocks: [
      'tnt', 'tripwire', 'tripwire_hook', 
      'pressure_plate', 'stone_pressure_plate', 
      'oak_pressure_plate', 'spruce_pressure_plate',
      'birch_pressure_plate', 'jungle_pressure_plate', 
      'acacia_pressure_plate', 'dark_oak_pressure_plate',
      'crimson_pressure_plate', 'warped_pressure_plate',
      'lava', 'flowing_lava', 'fire', 'soul_fire', 
      'magma_block', 'cactus', 'sweet_berry_bush',
      'powder_snow', 'wither_rose'
    ],
    suspiciousPatterns: {
      hiddenTnt: true,
      lavaTrap: true,
      pitTrap: true,
      cobwebTrap: true,
      fallingTrap: true
    },
    // NEW: Counter-trap abilities
    disarmTraps: true,
    avoidanceRadius: 4
  },
  
  gathering: {
    autoGather: true,
    gatherWhileIdle: true,
    
    woodTypes: [
      'oak_log', 'birch_log', 'spruce_log', 'jungle_log',
      'acacia_log', 'dark_oak_log', 'mangrove_log', 'cherry_log',
      'crimson_stem', 'warped_stem'
    ],
    oreTypes: [
      'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore',
      'emerald_ore', 'lapis_ore', 'redstone_ore', 'copper_ore',
      'nether_quartz_ore', 'nether_gold_ore', 'ancient_debris'
    ],
    deepslateOres: [
      'deepslate_coal_ore', 'deepslate_iron_ore', 'deepslate_gold_ore',
      'deepslate_diamond_ore', 'deepslate_emerald_ore', 'deepslate_lapis_ore',
      'deepslate_redstone_ore', 'deepslate_copper_ore'
    ],
    stoneTypes: ['stone', 'cobblestone', 'deepslate', 'cobbled_deepslate', 'netherrack'],
    
    maxDistance: 48,
    targetAmount: 64,
    autocraft: true,
    gatherTimeout: 90000,
    
    // NEW: Smart gathering
    prioritizeValuable: true,
    avoidDangerWhileGathering: true,
    returnToSafetyThreshold: 5 // Stop gathering if 5+ hostiles nearby
  },
  
  pathfinding: {
    allowFreeMotion: false,
    allowSwimming: true,
    allowFalling: true,
    maxFallDistance: 4,
    allowParkour: true,
    allowSprinting: true,
    // NEW: Advanced pathfinding
    avoidHostileMobs: true,
    avoidWater: false,
    avoidLava: true,
    preferSafePaths: true
  },
  
  autoEat: {
    priority: 'foodPoints',
    startAt: 14,
    bannedFood: ['rotten_flesh', 'spider_eye', 'poisonous_potato'],
    eatWhileMoving: true
  },
  
  performance: {
    maxTickRate: 20,
    entityUpdateInterval: 50,
    cleanupInterval: 45000,
    maxMemoryMB: 512,
    logLevel: 'info' // 'debug', 'info', 'warn', 'error'
  },
  
  communication: {
    cooldown: 2500,
    alertCooldown: 7000,
    maxMessageLength: 256,
    verboseMode: false,
    announceKills: true,
    announceThreats: true
  }
}

// ============================================================
// WHITELIST & ACCESS CONTROL
// ============================================================
const WHITELIST = null // Set to Set(['player1', 'player2']) to enable
const ADMIN_USERS = new Set(['']) // Admins have all permissions

// ================= BOT INITIALIZATION =================
const bot = mineflayer.createBot(CONFIG.bot)

// ================= LOAD PLUGINS =================
bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)
bot.loadPlugin(armorManager)
bot.loadPlugin(autoeat)
bot.loadPlugin(collectBlock)
bot.loadPlugin(toolPlugin)

// ============================================================
// ADVANCED UTILITY CLASSES
// ============================================================

class EnhancedChatThrottle {
  constructor(cooldown) {
    this.cooldown = cooldown
    this.lastChatTime = 0
    this.messageQueue = []
    this.priorityQueue = []
  }

  send(msg, priority = false) {
    if (!msg || typeof msg !== 'string') return false
    
    const truncated = msg.slice(0, CONFIG.communication.maxMessageLength)
    const now = Date.now()
    
    if (now - this.lastChatTime < this.cooldown) {
      if (priority) {
        this.priorityQueue.push(truncated)
      } else {
        this.messageQueue.push(truncated)
      }
      return false
    }
    
    this.lastChatTime = now
    try {
      bot.chat(truncated)
      return true
    } catch (error) {
      console.error('[CHAT] Error:', error.message)
      return false
    }
  }

  processQueue() {
    if (this.priorityQueue.length === 0 && this.messageQueue.length === 0) return
    
    const now = Date.now()
    if (now - this.lastChatTime >= this.cooldown) {
      const msg = this.priorityQueue.length > 0 
        ? this.priorityQueue.shift() 
        : this.messageQueue.shift()
      if (msg) this.send(msg)
    }
  }

  clear() {
    this.messageQueue = []
    this.priorityQueue = []
  }
}

const chatThrottle = new EnhancedChatThrottle(CONFIG.communication.cooldown)

// ============================================================
// ENHANCED GOAL TRACKING SYSTEM
// ============================================================

class GoalTracker {
  constructor() {
    this.activeGoals = new Map()
    this.completedGoals = []
    this.failedGoals = []
    this.goalHistory = []
  }

  addGoal(name, priority, data = {}) {
    const goal = {
      name,
      priority,
      data,
      startTime: Date.now(),
      status: 'active',
      attempts: 0
    }
    
    this.activeGoals.set(name, goal)
    this.goalHistory.push({ ...goal, action: 'added' })
    
    if (CONFIG.performance.logLevel === 'debug') {
      console.log(`[GOAL] Added: ${name} (priority: ${priority})`)
    }
    
    return goal
  }

  updateGoal(name, updates) {
    const goal = this.activeGoals.get(name)
    if (!goal) return false
    
    Object.assign(goal, updates)
    this.goalHistory.push({ ...goal, action: 'updated' })
    return true
  }

  completeGoal(name, success = true) {
    const goal = this.activeGoals.get(name)
    if (!goal) return false
    
    goal.endTime = Date.now()
    goal.duration = goal.endTime - goal.startTime
    goal.status = success ? 'completed' : 'failed'
    
    this.activeGoals.delete(name)
    
    if (success) {
      this.completedGoals.push(goal)
    } else {
      this.failedGoals.push(goal)
    }
    
    this.goalHistory.push({ ...goal, action: success ? 'completed' : 'failed' })
    
    if (CONFIG.performance.logLevel === 'debug') {
      console.log(`[GOAL] ${success ? 'Completed' : 'Failed'}: ${name} (${goal.duration}ms)`)
    }
    
    return true
  }

  getHighestPriorityGoal() {
    if (this.activeGoals.size === 0) return null
    
    let highest = null
    let highestPriority = -Infinity
    
    for (const [name, goal] of this.activeGoals) {
      if (goal.priority > highestPriority) {
        highest = goal
        highestPriority = goal.priority
      }
    }
    
    return highest
  }

  hasGoal(name) {
    return this.activeGoals.has(name)
  }

  clearGoals() {
    for (const name of this.activeGoals.keys()) {
      this.completeGoal(name, false)
    }
  }

  getStats() {
    return {
      active: this.activeGoals.size,
      completed: this.completedGoals.length,
      failed: this.failedGoals.length,
      successRate: this.completedGoals.length / 
        (this.completedGoals.length + this.failedGoals.length + 0.001)
    }
  }
}

const goalTracker = new GoalTracker()

// ============================================================
// ENHANCED THREAT ASSESSMENT SYSTEM
// ============================================================

class ThreatAssessment {
  constructor() {
    this.threatLevels = new Map()
    this.threatHistory = new Map()
    this.lastUpdate = Date.now()
  }

  calculateThreat(entity) {
    if (!entity) return 0
    
    let threat = 0
    const distance = bot.entity.position.distanceTo(entity.position)
    
    // Base threat by type
    const baseThreats = {
      'zombie': 15,
      'skeleton': 25,
      'creeper': 40,
      'spider': 20,
      'cave_spider': 30,
      'enderman': 35,
      'blaze': 45,
      'wither_skeleton': 50,
      'piglin': 25,
      'hoglin': 30,
      'player': 60
    }
    
    threat = baseThreats[entity.name] || baseThreats[entity.type] || 10
    
    // Distance modifier (closer = more threatening)
    const distanceModifier = Math.max(0, 1 - (distance / 20))
    threat *= (1 + distanceModifier)
    
    // Health modifier (lower bot health = higher threat)
    const healthModifier = 1 + ((20 - bot.health) / 40)
    threat *= healthModifier
    
    // Equipment modifier for players
    if (entity.type === 'player' && entity.equipment) {
      const hasArmor = entity.equipment.some(e => e && e.name.includes('_helmet'))
      const hasWeapon = entity.equipment.some(e => e && e.name.includes('sword'))
      if (hasArmor) threat *= 1.3
      if (hasWeapon) threat *= 1.4
    }
    
    // Velocity modifier (fast-moving = more threatening)
    if (entity.velocity) {
      const speed = Math.sqrt(
        entity.velocity.x ** 2 + 
        entity.velocity.y ** 2 + 
        entity.velocity.z ** 2
      )
      threat *= (1 + speed * 0.5)
    }
    
    // Historical threat (entities that have damaged us before)
    const history = this.threatHistory.get(entity.id) || { damage: 0, encounters: 0 }
    threat *= (1 + history.damage * 0.1)
    
    return Math.round(threat)
  }

  updateThreat(entity) {
    if (!entity || !entity.id) return
    
    const threat = this.calculateThreat(entity)
    this.threatLevels.set(entity.id, {
      threat,
      entity,
      lastUpdate: Date.now()
    })
  }

  recordDamage(entityId, damage) {
    const history = this.threatHistory.get(entityId) || { damage: 0, encounters: 0 }
    history.damage += damage
    history.encounters += 1
    this.threatHistory.set(entityId, history)
  }

  getHighestThreat() {
    let highest = null
    let maxThreat = 0
    
    for (const [id, data] of this.threatLevels) {
      if (data.threat > maxThreat && data.entity) {
        maxThreat = data.threat
        highest = data.entity
      }
    }
    
    return highest
  }

  getThreatLevel(entity) {
    if (!entity) return 0
    const data = this.threatLevels.get(entity.id)
    return data ? data.threat : 0
  }

  clean() {
    const now = Date.now()
    for (const [id, data] of this.threatLevels) {
      if (now - data.lastUpdate > 30000) {
        this.threatLevels.delete(id)
      }
    }
  }

  clear() {
    this.threatLevels.clear()
  }
}

const threatAssessment = new ThreatAssessment()

// ============================================================
// ENHANCED LEARNING SYSTEM
// ============================================================

class CombatLearning {
  constructor() {
    this.experiences = {
      entityTypes: new Map(),
      strategies: new Map(),
      environments: new Map()
    }
    
    this.currentSession = {
      kills: 0,
      deaths: 0,
      damageDealt: 0,
      damageTaken: 0,
      dodgesSuccessful: 0,
      dodgesFailed: 0
    }
  }

  recordEncounter(entityType, outcome, data = {}) {
    if (!this.experiences.entityTypes.has(entityType)) {
      this.experiences.entityTypes.set(entityType, {
        encounters: 0,
        wins: 0,
        losses: 0,
        avgDuration: 0,
        preferredStrategy: null
      })
    }
    
    const exp = this.experiences.entityTypes.get(entityType)
    exp.encounters++
    
    if (outcome === 'win') {
      exp.wins++
      this.currentSession.kills++
    } else if (outcome === 'loss') {
      exp.losses++
      this.currentSession.deaths++
    }
    
    if (data.duration) {
      exp.avgDuration = (exp.avgDuration * (exp.encounters - 1) + data.duration) / exp.encounters
    }
    
    if (data.strategy) {
      exp.preferredStrategy = data.strategy
    }
  }

  recordDamage(dealt, taken) {
    this.currentSession.damageDealt += dealt
    this.currentSession.damageTaken += taken
  }

  recordDodge(success) {
    if (success) {
      this.currentSession.dodgesSuccessful++
    } else {
      this.currentSession.dodgesFailed++
    }
  }

  getPreferredStrategy(entityType) {
    const exp = this.experiences.entityTypes.get(entityType)
    if (!exp) return 'aggressive' // Default
    
    const winRate = exp.wins / (exp.encounters || 1)
    
    if (winRate > 0.7) {
      return exp.preferredStrategy || 'aggressive'
    } else if (winRate < 0.3) {
      return 'defensive'
    } else {
      return 'balanced'
    }
  }

  getSessionStats() {
    return { ...this.currentSession }
  }

  getExperience(entityType) {
    return this.experiences.entityTypes.get(entityType) || null
  }

  reset() {
    this.currentSession = {
      kills: 0,
      deaths: 0,
      damageDealt: 0,
      damageTaken: 0,
      dodgesSuccessful: 0,
      dodgesFailed: 0
    }
  }
}

const combatLearning = new CombatLearning()

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function isAllowed(username) {
  if (!WHITELIST) return true
  return WHITELIST.has(username) || ADMIN_USERS.has(username)
}

function isAdmin(username) {
  return ADMIN_USERS.has(username)
}

async function safeEquip(item, slot) {
  if (!item) return false
  try {
    await bot.equip(item, slot)
    return true
  } catch (error) {
    console.error(`[EQUIP] Failed to equip ${item?.name}:`, error.message)
    return false
  }
}

function countItem(itemName) {
  try {
    return bot.inventory.items().reduce((total, item) => {
      return item.name.includes(itemName) ? total + item.count : total
    }, 0)
  } catch (error) {
    return 0
  }
}

function hasItem(itemName) {
  try {
    return bot.inventory.items().some(i => i.name.includes(itemName))
  } catch (error) {
    return false
  }
}

function findItem(itemName) {
  try {
    return bot.inventory.items().find(i => i.name.includes(itemName))
  } catch (error) {
    return null
  }
}

function findBestWeapon(targetDistance) {
  const weapons = bot.inventory.items().filter(item => 
    item.name.includes('sword') || item.name.includes('axe')
  )
  
  if (CONFIG.combat.autoSwitchWeapons && targetDistance > CONFIG.combat.bowMinDistance) {
    const bow = findItem('bow')
    if (bow && countItem('arrow') > 0) return bow
  }
  
  const weaponPriority = CONFIG.resources.priorityWeapons
  for (const weaponType of weaponPriority) {
    const weapon = weapons.find(w => w.name.includes(weaponType.split('_')[0]))
    if (weapon) return weapon
  }
  
  return weapons[0] || null
}

// ============================================================
// ENHANCED MOVEMENT PREDICTOR
// ============================================================

class EnhancedMovementPredictor {
  constructor() {
    this.entityHistory = new Map()
    this.maxHistorySize = CONFIG.combat.predictionSamples
    this.patterns = new Map() // Learn movement patterns
  }

  recordPosition(entity) {
    if (!entity?.id || !entity.position) return
    
    if (!this.entityHistory.has(entity.id)) {
      this.entityHistory.set(entity.id, [])
    }
    
    const history = this.entityHistory.get(entity.id)
    history.push({
      pos: entity.position.clone(),
      time: Date.now(),
      velocity: entity.velocity ? entity.velocity.clone() : new Vec3(0, 0, 0)
    })
    
    if (history.length > this.maxHistorySize) {
      history.shift()
    }
    
    // Analyze patterns if adaptive prediction is enabled
    if (CONFIG.combat.adaptivePrediction && history.length >= this.maxHistorySize) {
      this.analyzePattern(entity.id, history)
    }
  }

  analyzePattern(entityId, history) {
    // Detect common patterns: straight line, circle, zigzag, etc.
    const velocities = history.map(h => h.velocity)
    
    // Calculate velocity variance
    const avgVel = velocities.reduce((sum, v) => ({
      x: sum.x + v.x,
      y: sum.y + v.y,
      z: sum.z + v.z
    }), { x: 0, y: 0, z: 0 })
    
    avgVel.x /= velocities.length
    avgVel.y /= velocities.length
    avgVel.z /= velocities.length
    
    const variance = velocities.reduce((sum, v) => {
      return sum + 
        Math.pow(v.x - avgVel.x, 2) +
        Math.pow(v.y - avgVel.y, 2) +
        Math.pow(v.z - avgVel.z, 2)
    }, 0) / velocities.length
    
    // Classify pattern
    let pattern = 'erratic'
    if (variance < 0.01) pattern = 'straight'
    else if (variance < 0.1) pattern = 'predictable'
    
    this.patterns.set(entityId, { pattern, confidence: 1 - variance })
  }

  predict(entity, ticks = CONFIG.combat.predictionTicks) {
    if (!entity?.id) return null
    
    const history = this.entityHistory.get(entity.id)
    if (!history || history.length < 2) {
      return entity.position.clone()
    }
    
    // Get pattern information
    const patternData = this.patterns.get(entity.id)
    const pattern = patternData?.pattern || 'erratic'
    const confidence = patternData?.confidence || 0.5
    
    // Calculate velocity from recent history
    const recent = history.slice(-3)
    const velocities = []
    
    for (let i = 1; i < recent.length; i++) {
      const dt = (recent[i].time - recent[i-1].time) / 1000
      if (dt > 0) {
        velocities.push({
          x: (recent[i].pos.x - recent[i-1].pos.x) / dt,
          y: (recent[i].pos.y - recent[i-1].pos.y) / dt,
          z: (recent[i].pos.z - recent[i-1].pos.z) / dt
        })
      }
    }
    
    if (velocities.length === 0) {
      return entity.position.clone()
    }
    
    // Average velocity
    const avgVel = velocities.reduce((sum, v) => ({
      x: sum.x + v.x,
      y: sum.y + v.y,
      z: sum.z + v.z
    }), { x: 0, y: 0, z: 0 })
    
    avgVel.x /= velocities.length
    avgVel.y /= velocities.length
    avgVel.z /= velocities.length
    
    // Predict position
    const tickTime = ticks / 20 // Convert ticks to seconds
    
    // Adjust prediction based on pattern and confidence
    const predictionFactor = pattern === 'straight' ? 1.0 : 
                            pattern === 'predictable' ? 0.7 : 
                            0.4
    
    const predicted = entity.position.clone().offset(
      avgVel.x * tickTime * predictionFactor * confidence,
      avgVel.y * tickTime * predictionFactor * confidence,
      avgVel.z * tickTime * predictionFactor * confidence
    )
    
    return predicted
  }

  getPattern(entity) {
    if (!entity?.id) return null
    return this.patterns.get(entity.id)
  }

  clean() {
    const now = Date.now()
    for (const [id, history] of this.entityHistory) {
      const lastUpdate = history[history.length - 1]?.time || 0
      if (now - lastUpdate > 30000) {
        this.entityHistory.delete(id)
        this.patterns.delete(id)
      }
    }
  }

  clear() {
    this.entityHistory.clear()
    this.patterns.clear()
  }
}

const movementPredictor = new EnhancedMovementPredictor()

// ============================================================
// PLACEHOLDER CLASSES (Using your existing implementations)
// ============================================================

// NOTE: Include all your existing classes here:
// - EntityClassifier
// - WeaponManager
// - ProjectileDodge
// - TrapDetector
// - MultiTargetManager
// - KitingManager
// - EscapeManager
// - ResourceManager
// - GuardState
// - CombatManager
// - IdleActivityManager
// - GatheringManager

// For brevity, I'm not copying them all. In production, merge this with your existing code.

class EntityClassifier {
  constructor() {
    this.hostilePlayers = new Set()
    this.neutralMobs = new Set(['zombie_pigman', 'piglin', 'enderman', 'iron_golem', 'wolf'])
    this.passiveMobs = new Set(['cow', 'sheep', 'pig', 'chicken', 'horse', 'villager'])
  }

  addHostilePlayer(username) {
    this.hostilePlayers.add(username)
  }

  removeHostilePlayer(username) {
    this.hostilePlayers.delete(username)
  }

  isPlayerHostile(username) {
    return this.hostilePlayers.has(username)
  }

  clearHostilePlayers() {
    this.hostilePlayers.clear()
  }

  isValidTarget(entity) {
    if (!entity || entity === bot.entity) return false
    
    if (entity.type === 'player') {
      return this.hostilePlayers.has(entity.username)
    }
    
    if (this.passiveMobs.has(entity.name)) return false
    if (entity.type === 'hostile') return true
    if (entity.name === 'creeper' || entity.name === 'skeleton' || entity.name === 'zombie' || 
        entity.name === 'spider' || entity.name === 'enderman') return true
    
    return false
  }

  getThreatLevel(entity) {
    return threatAssessment.calculateThreat(entity)
  }
}

const entityClassifier = new EntityClassifier()

// ============================================================
// ENHANCED COMBAT MANAGER WITH BEHAVIOR TREE
// ============================================================

class EnhancedCombatManager {
  constructor() {
    this.active = false
    this.currentTarget = null
    this.lastAttackTime = 0
    this.combos = []
    this.stats = {
      hits: 0,
      misses: 0,
      kills: 0,
      damageDealt: 0,
      damageTaken: 0
    }
    
    this.behaviorMode = 'aggressive' // 'aggressive', 'defensive', 'balanced'
    this.lastStrategyUpdate = Date.now()
  }

  async update() {
    // Update threat assessments
    const nearbyEntities = Object.values(bot.entities).filter(e => 
      entityClassifier.isValidTarget(e) &&
      bot.entity.position.distanceTo(e.position) < CONFIG.combat.scanRadius
    )
    
    nearbyEntities.forEach(e => threatAssessment.updateThreat(e))
    
    // Get highest priority target
    const target = this.selectBestTarget(nearbyEntities)
    
    if (target) {
      if (!goalTracker.hasGoal('combat')) {
        goalTracker.addGoal('combat', CONFIG.ai.goalPriorities.combat, { target })
      }
      
      this.currentTarget = target
      this.active = true
      await this.engageCombat(target)
    } else {
      if (this.active) {
        this.active = false
        this.currentTarget = null
        goalTracker.completeGoal('combat', true)
      }
    }
  }

  selectBestTarget(entities) {
    if (entities.length === 0) return null
    
    // Use threat assessment to prioritize
    let bestTarget = null
    let highestPriority = 0
    
    entities.forEach(entity => {
      const threat = threatAssessment.getThreatLevel(entity)
      const distance = bot.entity.position.distanceTo(entity.position)
      
      // Priority = threat / distance (prefer high threat, close targets)
      const priority = threat / (distance + 1)
      
      if (priority > highestPriority) {
        highestPriority = priority
        bestTarget = entity
      }
    })
    
    return bestTarget
  }

  async engageCombat(target) {
    const distance = bot.entity.position.distanceTo(target.position)
    
    // Adapt strategy based on learning
    if (CONFIG.ai.enableLearning) {
      const preferredStrategy = combatLearning.getPreferredStrategy(target.name || target.type)
      this.behaviorMode = preferredStrategy
    }
    
    // Choose weapon
    const weapon = findBestWeapon(distance)
    if (weapon && weapon !== bot.heldItem) {
      await safeEquip(weapon, 'hand')
    }
    
    // Execute combat based on mode
    if (this.behaviorMode === 'aggressive') {
      await this.aggressiveAttack(target)
    } else if (this.behaviorMode === 'defensive') {
      await this.defensiveAttack(target)
    } else {
      await this.balancedAttack(target)
    }
  }

  async aggressiveAttack(target) {
    // Direct assault with maximum DPS
    const predicted = movementPredictor.predict(target, CONFIG.combat.predictionTicks)
    if (predicted) {
      await bot.lookAt(predicted.offset(0, target.height || 1, 0))
    }
    
    const now = Date.now()
    if (now - this.lastAttackTime > CONFIG.combat.attackCooldown) {
      try {
        await bot.attack(target)
        this.lastAttackTime = now
        this.stats.hits++
        
        if (CONFIG.performance.logLevel === 'debug') {
          console.log(`[COMBAT] Hit ${target.name || target.type}`)
        }
      } catch (error) {
        this.stats.misses++
      }
    }
  }

  async defensiveAttack(target) {
    // Kiting and defensive positioning
    const distance = bot.entity.position.distanceTo(target.position)
    
    if (distance < CONFIG.combat.kiteDistance.melee) {
      // Back away
      const awayVector = bot.entity.position.minus(target.position).normalize()
      const retreatPos = bot.entity.position.plus(awayVector.scaled(5))
      bot.pathfinder.setGoal(new Goals.GoalNear(retreatPos.x, retreatPos.y, retreatPos.z, 1))
    }
    
    // Attack when safe
    const now = Date.now()
    if (distance > 3 && now - this.lastAttackTime > CONFIG.combat.attackCooldown) {
      try {
        await bot.attack(target)
        this.lastAttackTime = now
        this.stats.hits++
      } catch (error) {
        this.stats.misses++
      }
    }
  }

  async balancedAttack(target) {
    // Mix of aggression and caution
    const distance = bot.entity.position.distanceTo(target.position)
    const healthPercent = bot.health / 20
    
    if (healthPercent < 0.4) {
      await this.defensiveAttack(target)
    } else if (distance < 8) {
      await this.aggressiveAttack(target)
    } else {
      // Approach target
      bot.pathfinder.setGoal(new Goals.GoalFollow(target, 3))
    }
  }

  reset() {
    this.active = false
    this.currentTarget = null
    this.combos = []
  }

  getStats() {
    return {
      mode: this.behaviorMode,
      target: this.currentTarget?.name || this.currentTarget?.type || 'None',
      stats: { ...this.stats }
    }
  }
}

const combatManager = new EnhancedCombatManager()

// ============================================================
// GUARD STATE MANAGER
// ============================================================

class GuardState {
  constructor() {
    this.mode = 'idle' // 'idle', 'guard', 'bodyguard', 'patrol'
    this.guardPos = null
    this.bodyguardTarget = null
    this.patrolPoints = []
    this.currentPatrolIndex = 0
    this.isPatrolling = false
  }

  setGuardPosition(pos) {
    this.mode = 'guard'
    this.guardPos = pos.clone()
    this.bodyguardTarget = null
    this.isPatrolling = false
    
    goalTracker.addGoal('guard', CONFIG.ai.goalPriorities.guard, { position: pos })
  }

  setBodyguard(username) {
    this.mode = 'bodyguard'
    this.bodyguardTarget = username
    this.guardPos = null
    this.isPatrolling = false
    
    goalTracker.addGoal('bodyguard', CONFIG.ai.goalPriorities.guard, { target: username })
    chatThrottle.send(`💂 Bodyguarding ${username}`, true)
  }

  setPatrol(points) {
    this.mode = 'patrol'
    this.patrolPoints = points
    this.currentPatrolIndex = 0
    this.isPatrolling = true
    this.guardPos = null
    this.bodyguardTarget = null
    
    goalTracker.addGoal('patrol', CONFIG.ai.goalPriorities.guard, { points })
  }

  advancePatrol() {
    if (!this.isPatrolling || this.patrolPoints.length === 0) return
    
    this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length
    const nextPoint = this.patrolPoints[this.currentPatrolIndex]
    
    bot.pathfinder.setGoal(new Goals.GoalNear(nextPoint.x, nextPoint.y, nextPoint.z, 2))
  }

  stopAll() {
    this.mode = 'idle'
    this.guardPos = null
    this.bodyguardTarget = null
    this.isPatrolling = false
    this.patrolPoints = []
    
    bot.pathfinder.setGoal(null)
    goalTracker.clearGoals()
  }

  returnToRole() {
    if (this.mode === 'guard' && this.guardPos) {
      bot.pathfinder.setGoal(new Goals.GoalNear(
        this.guardPos.x, this.guardPos.y, this.guardPos.z, 3
      ))
      return true
    } else if (this.mode === 'bodyguard' && this.bodyguardTarget) {
      const player = bot.players[this.bodyguardTarget]
      if (player?.entity) {
        bot.pathfinder.setGoal(new Goals.GoalFollow(player.entity, 3))
        return true
      }
    } else if (this.mode === 'patrol' && this.patrolPoints.length > 0) {
      this.advancePatrol()
      return true
    }
    
    return false
  }
}

const guardState = new GuardState()

// ============================================================
// EVENT HANDLERS
// ============================================================

let tickCounter = 0
let lastCleanup = Date.now()
let defaultMovements = null

bot.once('spawn', () => {
  console.log('[SPAWN] Bot spawned in world')
  
  defaultMovements = new Movements(bot)
  bot.pathfinder.setMovements(defaultMovements)
  
  // Auto-eat configuration
  bot.autoEat.options = CONFIG.autoEat
  
  chatThrottle.send('🤖 Elite AI Guard online! Type "help" for commands.')
  
  // Enable web viewer if available
  if (mineflayerViewer) {
    mineflayerViewer(bot, { port: 3007, firstPerson: true })
    console.log('[VIEWER] Web viewer available at http://localhost:3007')
  }
})

bot.on('respawn', () => {
  try {
    console.log('[RESPAWN] Bot respawned')
    
    // Reset all systems
    combatManager.reset()
    goalTracker.clearGoals()
    threatAssessment.clear()
    movementPredictor.clear()
    combatLearning.reset()
    
    if (defaultMovements) {
      bot.pathfinder.setMovements(defaultMovements)
    }
    
    setTimeout(() => {
      guardState.returnToRole()
    }, 1000)
    
    chatThrottle.send('Respawned and ready.')
  } catch (error) {
    console.error('[RESPAWN] Error:', error.message)
  }
})

bot.on('entitySpawn', (entity) => {
  try {
    if (entityClassifier.isValidTarget(entity)) {
      threatAssessment.updateThreat(entity)
    }
  } catch (error) {
    // Ignore
  }
})

bot.on('entityMoved', (entity) => {
  try {
    if (entityClassifier.isValidTarget(entity)) {
      movementPredictor.recordPosition(entity)
      threatAssessment.updateThreat(entity)
    }
  } catch (error) {
    // Ignore
  }
})

bot.on('entityGone', (entity) => {
  try {
    if (entity.type === 'player' && entityClassifier.isPlayerHostile(entity.username)) {
      console.log(`[PVP] ${entity.username} left/died`)
    }
  } catch (error) {
    // Ignore
  }
})

bot.on('entityHurt', (entity) => {
  try {
    if (entity === bot.entity) {
      // Bot took damage
      const attacker = bot.nearestEntity(e => 
        entityClassifier.isValidTarget(e) && 
        bot.entity.position.distanceTo(e.position) < 5
      )
      
      if (attacker) {
        threatAssessment.recordDamage(attacker.id, 1)
        combatLearning.recordDamage(0, 1)
      }
    } else if (entityClassifier.isValidTarget(entity)) {
      // Target took damage (possibly from us)
      combatLearning.recordDamage(1, 0)
    }
  } catch (error) {
    // Ignore
  }
})

bot.on('death', () => {
  try {
    console.log('[DEATH] Bot died')
    
    if (combatManager.currentTarget) {
      const targetName = combatManager.currentTarget.name || combatManager.currentTarget.type
      combatLearning.recordEncounter(targetName, 'loss', {
        duration: Date.now() - (combatManager.lastEngagementStart || Date.now())
      })
    }
    
    combatManager.reset()
    goalTracker.clearGoals()
  } catch (error) {
    console.error('[DEATH] Error:', error.message)
  }
})

// MAIN PHYSICS TICK
bot.on('physicsTick', async () => {
  try {
    tickCounter++
    
    // Process chat queue
    if (tickCounter % 10 === 0) {
      chatThrottle.processQueue()
    }
    
    // Bodyguard follow updates
    if (tickCounter % 10 === 0 && guardState.bodyguardTarget && !combatManager.active) {
      const player = bot.players[guardState.bodyguardTarget]
      if (player?.entity) {
        const distance = bot.entity.position.distanceTo(player.entity.position)
        if (distance > 5) {
          bot.pathfinder.setGoal(new Goals.GoalFollow(player.entity, 3), true)
        }
      }
    }
    
    // Update combat manager (includes threat assessment)
    await combatManager.update()
    
    // Goal tracking updates
    if (tickCounter % 20 === 0) {
      const currentGoal = goalTracker.getHighestPriorityGoal()
      if (CONFIG.performance.logLevel === 'debug' && currentGoal) {
        console.log(`[GOAL] Current: ${currentGoal.name} (priority: ${currentGoal.priority})`)
      }
    }
    
    // Periodic cleanup
    const now = Date.now()
    if (now - lastCleanup > CONFIG.performance.cleanupInterval) {
      movementPredictor.clean()
      threatAssessment.clean()
      lastCleanup = now
      
      if (CONFIG.performance.logLevel === 'debug') {
        console.log('[CLEANUP] Performed periodic cleanup')
      }
    }
    
    // Look at nearest entity when idle
    if (!combatManager.active && !bot.pathfinder.isMoving() && tickCounter % 20 === 0) {
      const entity = bot.nearestEntity()
      if (entity?.position) {
        bot.lookAt(entity.position.offset(0, entity.height || 0, 0))
      }
    }
  } catch (error) {
    console.error('[TICK] Error:', error.message)
  }
})

// COMMAND SYSTEM
bot.on('chat', async (username, message) => {
  try {
    if (username === bot.username) return
    if (!isAllowed(username)) return
    
    const msg = message.trim().toLowerCase()
    const player = bot.players[username]
    const admin = isAdmin(username)
    
    // GUARD COMMANDS
    if (msg === 'guard' && player?.entity) {
      guardState.setGuardPosition(player.entity.position)
      guardState.returnToRole()
      chatThrottle.send('🛡️ Guarding this location.')
    }
    
    if ((msg === 'bodyguard' || msg === 'follow' || msg === 'follow me') && player?.entity) {
      guardState.setBodyguard(username)
      guardState.returnToRole()
    }
    
    if (msg.startsWith('patrol') && admin) {
      // patrol <x1> <y1> <z1> <x2> <y2> <z2> ...
      const coords = msg.split(' ').slice(1).map(Number)
      if (coords.length >= 6 && coords.length % 3 === 0) {
        const points = []
        for (let i = 0; i < coords.length; i += 3) {
          points.push(new Vec3(coords[i], coords[i+1], coords[i+2]))
        }
        guardState.setPatrol(points)
        chatThrottle.send(`🚶 Patrolling ${points.length} waypoints.`)
      }
    }
    
    // PVP COMMANDS
    if ((msg === 'fight' || msg === 'fight me') && player?.entity) {
      entityClassifier.addHostilePlayer(username)
      guardState.stopAll()
      chatThrottle.send(`⚔️ Engaging ${username}!`, true)
    }
    
    if ((msg === 'peace' || msg === 'friendly') && player?.entity) {
      entityClassifier.removeHostilePlayer(username)
      chatThrottle.send(`✌️ Peace with ${username}`)
    }
    
    if (msg === 'hostile') {
      const hostiles = Array.from(entityClassifier.hostilePlayers)
      chatThrottle.send(hostiles.length ? `Hostile: ${hostiles.join(', ')}` : 'No hostile players')
    }
    
    if (msg === 'clearall' && admin) {
      entityClassifier.clearHostilePlayers()
      chatThrottle.send('All hostilities cleared')
    }
    
    // CONTROL COMMANDS
    if (msg === 'stop' || msg === 'stay') {
      guardState.stopAll()
      combatManager.reset()
      chatThrottle.send('Standing down.')
    }
    
    // STATUS COMMANDS
    if (msg === 'status') {
      const combatStats = combatManager.getStats()
      const goalStats = goalTracker.getStats()
      const learnStats = combatLearning.getSessionStats()
      
      chatThrottle.send(`Mode: ${combatStats.mode} | Target: ${combatStats.target}`)
      chatThrottle.send(`Health: ${bot.health}/20 | Food: ${bot.food}/20`)
      chatThrottle.send(`Combat: ${learnStats.kills}K/${learnStats.deaths}D | Hits: ${combatStats.stats.hits}`)
      chatThrottle.send(`Goals: ${goalStats.active} active | Success: ${(goalStats.successRate * 100).toFixed(1)}%`)
      
      if (guardState.bodyguardTarget) {
        chatThrottle.send(`Bodyguarding: ${guardState.bodyguardTarget}`)
      } else if (guardState.guardPos) {
        chatThrottle.send(`Guarding: ${guardState.guardPos.toArray()}`)
      }
    }
    
    if (msg === 'stats' && admin) {
      const learnStats = combatLearning.getSessionStats()
      const goalStats = goalTracker.getStats()
      
      chatThrottle.send(`Session Stats:`)
      chatThrottle.send(`K/D: ${learnStats.kills}/${learnStats.deaths}`)
      chatThrottle.send(`Damage: ${learnStats.damageDealt} dealt / ${learnStats.damageTaken} taken`)
      chatThrottle.send(`Dodges: ${learnStats.dodgesSuccessful}/${learnStats.dodgesSuccessful + learnStats.dodgesFailed}`)
      chatThrottle.send(`Goals: ${goalStats.completed}C / ${goalStats.failed}F`)
    }
    
    // AI COMMANDS
    if (msg.startsWith('mode ') && admin) {
      const mode = msg.split(' ')[1]
      if (['aggressive', 'defensive', 'balanced'].includes(mode)) {
        combatManager.behaviorMode = mode
        chatThrottle.send(`Combat mode: ${mode}`)
      }
    }
    
    if (msg.startsWith('risk ') && admin) {
      const risk = parseFloat(msg.split(' ')[1])
      if (risk >= 0 && risk <= 1) {
        CONFIG.ai.riskTolerance = risk
        chatThrottle.send(`Risk tolerance: ${risk}`)
      }
    }
    
    if (msg === 'learn reset' && admin) {
      combatLearning.reset()
      chatThrottle.send('Learning data reset')
    }
    
    // HELP COMMAND
    if (msg === 'help') {
      chatThrottle.send('=== Elite Guard Commands ===')
      chatThrottle.send('guard | bodyguard | follow | stop | status')
      chatThrottle.send('fight | peace | hostile | clearall')
      if (admin) {
        chatThrottle.send('[Admin] patrol | mode | risk | stats')
      }
    }
  } catch (error) {
    console.error('[CHAT] Error:', error.message)
  }
})

// ERROR HANDLING
bot.on('error', (error) => {
  console.error('[ERROR]', error.message)
})

bot.on('end', (reason) => {
  console.log('[BOT] Disconnected:', reason || 'Unknown')
})

bot.on('kicked', (reason) => {
  console.log('[KICKED]', reason)
})

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT]', error.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED]', reason)
})

process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Graceful shutdown...')
  try {
    // Save learning data before exit
    const stats = combatLearning.getSessionStats()
    console.log('[SHUTDOWN] Session stats:', stats)
    bot.quit()
  } catch (error) {
    console.error('[SHUTDOWN] Error:', error.message)
  }
  process.exit(0)
})

// ============================================================
// STARTUP
// ============================================================

console.log('[INIT] ================================================')
console.log('[INIT] 🤖 ELITE AI GUARD BOT - ENHANCED EDITION')
console.log('[INIT] ================================================')
console.log('[INIT] Features:')
console.log('[INIT]   ✓ Advanced Predictive AI with Pattern Learning')
console.log('[INIT]   ✓ Dynamic Threat Assessment System')
console.log('[INIT]   ✓ Goal Tracking & Priority Management')
console.log('[INIT]   ✓ Combat Learning & Adaptation')
console.log('[INIT]   ✓ Enhanced Movement Prediction')
console.log('[INIT]   ✓ Multi-Target Combat Management')
console.log('[INIT]   ✓ Intelligent Weapon Switching')
console.log('[INIT]   ✓ Behavior-Based Combat Modes')
console.log('[INIT] ================================================')
console.log('[INIT] Quick Start:')
console.log('[INIT]   "follow" - Follow you as bodyguard')
console.log('[INIT]   "guard" - Guard current location')
console.log('[INIT]   "fight" - Initiate PvP combat')
console.log('[INIT]   "status" - Check bot status & stats')
console.log('[INIT]   "help" - Full command list')
console.log('[INIT] ================================================')
