# Plugin Integration Guide for Elite Combat Guard Bot

This guide provides step-by-step instructions for integrating all recommended plugins into your combat guard bot.

---

## 📦 Installation Commands

### Core Plugins (Essential)
```bash
npm install mineflayer
npm install mineflayer-pathfinder
npm install mineflayer-pvp
npm install mineflayer-armor-manager
npm install mineflayer-auto-eat
npm install mineflayer-collectblock
npm install mineflayer-tool
npm install prismarine-viewer
npm install vec3
```

### Advanced Combat & AI
```bash
npm install mineflayer-bloodhound
npm install mineflayer-statemachine
npm install mineflayer-blockfinder
npm install mineflayer-hawkeye
npm install mineflayer-target-manager
```

### Resource Management
```bash
npm install mineflayer-auto-crystal
npm install mineflayer-chest-browser
npm install mineflayer-item-storage
npm install mineflayer-smelter
```

### Utility & Quality of Life
```bash
npm install mineflayer-web-inventory
npm install mineflayer-dashboard
npm install mineflayer-cmd
npm install mineflayer-chat-command
npm install mineflayer-viewer
```

### Advanced Features (Optional)
```bash
npm install mineflayer-builder
npm install mineflayer-scaffold
npm install mineflayer-farmer
npm install mineflayer-miner
npm install mineflayer-elytra
npm install mineflayer-bed
```

### Machine Learning (Experimental)
```bash
npm install brain.js
npm install @tensorflow/tfjs
npm install @tensorflow/tfjs-node
```

---

## 🔌 Plugin Integration Examples

### 1. Bloodhound - Enhanced Entity Tracking

**Installation:**
```bash
npm install mineflayer-bloodhound
```

**Integration:**
```javascript
const bloodhound = require('mineflayer-bloodhound')(mineflayer)

// In your EntityClassifier class, enhance with bloodhound:
class EnhancedEntityClassifier {
  constructor(bot) {
    this.bot = bot
    this.hostilePlayers = new Set()
  }

  getValidTargets(radius = 16) {
    // Use bloodhound for efficient entity queries
    return Object.values(this.bot.entities)
      .filter(e => this.isValidTarget(e))
      .filter(e => e.position.distanceTo(this.bot.entity.position) <= radius)
      .sort((a, b) => {
        const distA = a.position.distanceTo(this.bot.entity.position)
        const distB = b.position.distanceTo(this.bot.entity.position)
        return distA - distB
      })
  }

  getNearestHostile() {
    const hostiles = this.getValidTargets()
    return hostiles.length > 0 ? hostiles[0] : null
  }

  getHostilesInRange(radius) {
    return this.getValidTargets(radius)
  }
}
```

---

### 2. Hawkeye - Precision Ranged Combat

**Installation:**
```bash
npm install mineflayer-hawkeye
```

**Integration:**
```javascript
const hawkeyePlugin = require('mineflayer-hawkeye')

// Load plugin
bot.loadPlugin(hawkeyePlugin)

// Enhanced ranged combat manager
class RangedCombatManager {
  constructor(bot) {
    this.bot = bot
    this.activeShot = false
  }

  async shootTarget(target) {
    if (!this.bot.hawkeye) {
      console.error('[RANGED] Hawkeye plugin not loaded')
      return false
    }

    // Check if we have a bow and arrows
    const bow = this.bot.inventory.items().find(item => 
      item.name === 'bow'
    )
    const arrows = this.bot.inventory.items().find(item =>
      item.name === 'arrow'
    )

    if (!bow || !arrows) {
      return false
    }

    try {
      // Equip bow
      await this.bot.equip(bow, 'hand')

      // Use hawkeye for precise shot
      await this.bot.hawkeye.oneShot(target)
      
      console.log(`[RANGED] Shot at ${target.name || target.type}`)
      return true
    } catch (error) {
      console.error('[RANGED] Shot failed:', error.message)
      return false
    }
  }

  async autoAttackBow(target) {
    try {
      const bow = this.bot.inventory.items().find(item => 
        item.name === 'bow'
      )
      
      if (!bow) return false

      await this.bot.equip(bow, 'hand')
      
      // Start auto-attacking with bow
      this.bot.hawkeye.autoAttack(target)
      this.activeShot = true
      
      return true
    } catch (error) {
      console.error('[RANGED] Auto-attack failed:', error.message)
      return false
    }
  }

  stopAutoAttack() {
    if (this.bot.hawkeye && this.activeShot) {
      this.bot.hawkeye.stop()
      this.activeShot = false
    }
  }
}

// Usage in combat manager:
const rangedCombat = new RangedCombatManager(bot)

// In your combat update loop:
async function combatUpdate(target) {
  const distance = bot.entity.position.distanceTo(target.position)
  
  if (distance > CONFIG.combat.bowMinDistance && countItem('arrow') > 0) {
    // Use ranged combat
    await rangedCombat.autoAttackBow(target)
  } else {
    // Switch to melee
    rangedCombat.stopAutoAttack()
    // ... melee combat
  }
}
```

---

### 3. State Machine - Behavior Trees

**Installation:**
```bash
npm install mineflayer-statemachine
```

**Integration:**
```javascript
const { StateMachine, BehaviorIdle, BehaviorFollowEntity, StateTransition } = require('mineflayer-statemachine')

class BehaviorTreeCombat {
  constructor(bot) {
    this.bot = bot
    this.targets = new BehaviorIdle()
    this.stateMachine = null
    
    this.initializeStateMachine()
  }

  initializeStateMachine() {
    // Define behaviors (states)
    const idleState = new BehaviorIdle()
    const patrolState = new BehaviorPatrol(this.bot)
    const combatState = new BehaviorCombat(this.bot)
    const escapeState = new BehaviorEscape(this.bot)
    const gatherState = new BehaviorGather(this.bot)

    // Define transitions
    
    // Idle -> Combat (when hostile nearby)
    idleState.transitions.push(new StateTransition({
      parent: idleState,
      child: combatState,
      shouldTransition: () => {
        const hostile = this.getNearestHostile()
        return hostile !== null
      },
      onTransition: () => console.log('[STATE] Idle -> Combat')
    }))

    // Combat -> Escape (when low health)
    combatState.transitions.push(new StateTransition({
      parent: combatState,
      child: escapeState,
      shouldTransition: () => {
        return this.bot.health < CONFIG.combat.escapeHealthThreshold
      },
      onTransition: () => console.log('[STATE] Combat -> Escape')
    }))

    // Escape -> Idle (when safe)
    escapeState.transitions.push(new StateTransition({
      parent: escapeState,
      child: idleState,
      shouldTransition: () => {
        const hostile = this.getNearestHostile()
        return hostile === null && this.bot.health > 10
      },
      onTransition: () => console.log('[STATE] Escape -> Idle')
    }))

    // Idle -> Gather (when no threats and low resources)
    idleState.transitions.push(new StateTransition({
      parent: idleState,
      child: gatherState,
      shouldTransition: () => {
        return this.needsResources() && this.getNearestHostile() === null
      },
      onTransition: () => console.log('[STATE] Idle -> Gather')
    }))

    // Gather -> Idle (when resources gathered)
    gatherState.transitions.push(new StateTransition({
      parent: gatherState,
      child: idleState,
      shouldTransition: () => {
        return !this.needsResources()
      },
      onTransition: () => console.log('[STATE] Gather -> Idle')
    }))

    // Create state machine
    this.stateMachine = new StateMachine(this.bot, idleState)
  }

  getNearestHostile() {
    return entityClassifier.getNearestHostile()
  }

  needsResources() {
    return countItem('arrow') < 16 || bot.food < 14
  }
}

// Custom Behavior Classes
class BehaviorPatrol {
  constructor(bot) {
    this.bot = bot
    this.stateName = 'patrol'
    this.active = false
  }

  onStateEntered() {
    this.active = true
    console.log('[BEHAVIOR] Entering patrol state')
    // Start patrol logic
  }

  onStateExited() {
    this.active = false
    console.log('[BEHAVIOR] Exiting patrol state')
  }

  // This is called every tick while in this state
  update() {
    if (!this.active) return
    
    // Patrol logic here
    if (guardState.isPatrolling) {
      // Continue patrol
    }
  }
}

class BehaviorCombat {
  constructor(bot) {
    this.bot = bot
    this.stateName = 'combat'
    this.active = false
  }

  onStateEntered() {
    this.active = true
    console.log('[BEHAVIOR] Entering combat state')
    goalTracker.addGoal('combat', 90)
  }

  onStateExited() {
    this.active = false
    console.log('[BEHAVIOR] Exiting combat state')
    combatManager.reset()
    goalTracker.completeGoal('combat')
  }

  update() {
    if (!this.active) return
    
    // Delegate to combat manager
    combatManager.update()
  }
}

class BehaviorEscape {
  constructor(bot) {
    this.bot = bot
    this.stateName = 'escape'
    this.active = false
  }

  onStateEntered() {
    this.active = true
    console.log('[BEHAVIOR] Entering escape state')
    
    // Find safe location and run
    const safePos = this.findSafeLocation()
    if (safePos) {
      this.bot.pathfinder.setGoal(new Goals.GoalBlock(
        safePos.x, safePos.y, safePos.z
      ))
    }
  }

  onStateExited() {
    this.active = false
    console.log('[BEHAVIOR] Exiting escape state')
  }

  findSafeLocation() {
    // Find position far from hostiles
    const hostiles = entityClassifier.getValidTargets(32)
    if (hostiles.length === 0) return null

    // Calculate average hostile position
    const avgPos = hostiles.reduce((sum, h) => ({
      x: sum.x + h.position.x,
      y: sum.y + h.position.y,
      z: sum.z + h.position.z
    }), { x: 0, y: 0, z: 0 })

    avgPos.x /= hostiles.length
    avgPos.y /= hostiles.length
    avgPos.z /= hostiles.length

    // Run in opposite direction
    const awayVector = this.bot.entity.position.minus(new Vec3(avgPos.x, avgPos.y, avgPos.z)).normalize()
    const safePos = this.bot.entity.position.plus(awayVector.scaled(20))

    return safePos
  }

  update() {
    if (!this.active) return
    
    // Keep running if still in danger
    if (this.bot.health < CONFIG.combat.escapeHealthThreshold) {
      const safePos = this.findSafeLocation()
      if (safePos) {
        this.bot.pathfinder.setGoal(new Goals.GoalBlock(
          safePos.x, safePos.y, safePos.z
        ))
      }
    }
  }
}

class BehaviorGather {
  constructor(bot) {
    this.bot = bot
    this.stateName = 'gather'
    this.active = false
  }

  onStateEntered() {
    this.active = true
    console.log('[BEHAVIOR] Entering gather state')
    goalTracker.addGoal('gather', 50)
  }

  onStateExited() {
    this.active = false
    console.log('[BEHAVIOR] Exiting gather state')
    goalTracker.completeGoal('gather')
  }

  update() {
    if (!this.active) return
    
    // Delegate to gathering manager
    // gatheringManager.update()
  }
}
```

---

### 4. Block Finder - Resource Location

**Installation:**
```bash
npm install mineflayer-blockfinder
```

**Integration:**
```javascript
const blockFinderPlugin = require('mineflayer-blockfinder')(mineflayer)
bot.loadPlugin(blockFinderPlugin)

class ResourceLocator {
  constructor(bot) {
    this.bot = bot
  }

  findNearestOre(oreType = 'diamond_ore', maxDistance = 32) {
    try {
      const block = this.bot.findBlock({
        matching: block => 
          block.name === oreType || 
          block.name === `deepslate_${oreType}`,
        maxDistance: maxDistance,
        useExtraInfo: true
      })

      if (block) {
        console.log(`[RESOURCE] Found ${oreType} at ${block.position}`)
        return block
      }
      
      return null
    } catch (error) {
      console.error('[RESOURCE] Error finding ore:', error.message)
      return null
    }
  }

  findNearestTree(maxDistance = 32) {
    try {
      const logs = CONFIG.gathering.woodTypes

      const block = this.bot.findBlock({
        matching: block => logs.includes(block.name),
        maxDistance: maxDistance
      })

      if (block) {
        console.log(`[RESOURCE] Found tree at ${block.position}`)
        return block
      }
      
      return null
    } catch (error) {
      console.error('[RESOURCE] Error finding tree:', error.message)
      return null
    }
  }

  findStorage(maxDistance = 48) {
    try {
      const storageBlocks = this.bot.findBlocks({
        matching: block => 
          block.name === 'chest' || 
          block.name === 'barrel' ||
          block.name === 'shulker_box',
        maxDistance: maxDistance,
        count: 10
      })

      return storageBlocks.map(pos => this.bot.blockAt(pos))
    } catch (error) {
      console.error('[RESOURCE] Error finding storage:', error.message)
      return []
    }
  }

  findTrap(radius = 5) {
    try {
      const dangerousBlocks = CONFIG.traps.dangerousBlocks

      const traps = this.bot.findBlocks({
        matching: block => dangerousBlocks.includes(block.name),
        maxDistance: radius,
        count: 20
      })

      return traps.map(pos => ({
        position: pos,
        block: this.bot.blockAt(pos)
      }))
    } catch (error) {
      console.error('[TRAP] Error finding traps:', error.message)
      return []
    }
  }
}

const resourceLocator = new ResourceLocator(bot)

// Usage:
async function gatherResources() {
  const ore = resourceLocator.findNearestOre('diamond_ore', 48)
  if (ore) {
    await bot.pathfinder.goto(new Goals.GoalBlock(
      ore.position.x, ore.position.y, ore.position.z
    ))
    await bot.dig(ore)
  }
}
```

---

### 5. Web Inventory - Remote Management

**Installation:**
```bash
npm install mineflayer-web-inventory
```

**Integration:**
```javascript
const webInventory = require('mineflayer-web-inventory')

// Start web interface
webInventory(bot, { 
  port: 3000,
  password: 'secure_password_here' // Optional but recommended
})

console.log('[WEB] Inventory interface at http://localhost:3000')

// Extend with custom API endpoints
const express = require('express')
const app = express()

app.use(express.json())

// Custom status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    health: bot.health,
    food: bot.food,
    position: bot.entity.position,
    mode: guardState.mode,
    combatActive: combatManager.active,
    goals: goalTracker.getStats(),
    learning: combatLearning.getSessionStats()
  })
})

// Command endpoint
app.post('/api/command', (req, res) => {
  const { command, username } = req.body
  
  if (!isAllowed(username)) {
    return res.status(403).json({ error: 'Unauthorized' })
  }

  // Execute command
  try {
    bot.emit('chat', username, command)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Goals endpoint
app.get('/api/goals', (req, res) => {
  const goals = Array.from(goalTracker.activeGoals.values())
  res.json({ goals })
})

// Threats endpoint
app.get('/api/threats', (req, res) => {
  const threats = Array.from(threatAssessment.threatLevels.values())
    .sort((a, b) => b.threat - a.threat)
    .slice(0, 10)
  
  res.json({ threats })
})

app.listen(3001, () => {
  console.log('[API] Custom API available at http://localhost:3001')
})
```

---

### 6. Auto-Crystal - Crafting System

**Installation:**
```bash
npm install mineflayer-auto-crystal
```

**Integration:**
```javascript
const autoCrystal = require('mineflayer-auto-crystal')
bot.loadPlugin(autoCrystal)

class CraftingManager {
  constructor(bot) {
    this.bot = bot
    this.craftingQueue = []
  }

  async craftItem(itemName, quantity = 1) {
    try {
      const recipe = this.bot.recipesFor(itemName)[0]
      
      if (!recipe) {
        console.error(`[CRAFT] No recipe found for ${itemName}`)
        return false
      }

      // Check if we have materials
      if (!this.hasMaterials(recipe)) {
        console.error(`[CRAFT] Missing materials for ${itemName}`)
        return false
      }

      // Find crafting table if needed
      if (recipe.requiresTable) {
        const craftingTable = this.bot.findBlock({
          matching: block => block.name === 'crafting_table',
          maxDistance: 32
        })

        if (!craftingTable) {
          console.error('[CRAFT] No crafting table nearby')
          return false
        }

        await this.bot.pathfinder.goto(new Goals.GoalBlock(
          craftingTable.position.x,
          craftingTable.position.y,
          craftingTable.position.z
        ))
      }

      // Craft
      await this.bot.craft(recipe, quantity)
      console.log(`[CRAFT] Crafted ${quantity}x ${itemName}`)
      return true
      
    } catch (error) {
      console.error(`[CRAFT] Error crafting ${itemName}:`, error.message)
      return false
    }
  }

  hasMaterials(recipe) {
    for (const ingredient of recipe.delta) {
      if (ingredient.count < 0) {
        const itemCount = countItem(ingredient.id)
        if (itemCount < Math.abs(ingredient.count)) {
          return false
        }
      }
    }
    return true
  }

  async autoCraft() {
    // Auto-craft essential items
    const needs = this.assessNeeds()

    for (const item of needs) {
      await this.craftItem(item.name, item.quantity)
    }
  }

  assessNeeds() {
    const needs = []

    // Need arrows?
    if (countItem('arrow') < 16 && hasItem('flint') && hasItem('stick') && hasItem('feather')) {
      needs.push({ name: 'arrow', quantity: 16 })
    }

    // Need tools?
    if (!hasItem('pickaxe') && countItem('iron_ingot') >= 3 && countItem('stick') >= 2) {
      needs.push({ name: 'iron_pickaxe', quantity: 1 })
    }

    // Need food?
    if (bot.food < 10 && hasItem('wheat')) {
      needs.push({ name: 'bread', quantity: 8 })
    }

    return needs
  }
}

const craftingManager = new CraftingManager(bot)

// Auto-craft during idle time
setInterval(() => {
  if (!combatManager.active && !bot.pathfinder.isMoving()) {
    craftingManager.autoCraft()
  }
}, 30000)
```

---

### 7. Chest Browser - Storage Management

**Installation:**
```bash
npm install mineflayer-chest-browser
```

**Integration:**
```javascript
// Note: This is a hypothetical example as the actual API may vary
// Check the plugin's documentation for exact usage

class StorageManager {
  constructor(bot) {
    this.bot = bot
    this.knownChests = new Map() // Map chest positions to contents
  }

  async scanChest(chest) {
    try {
      const chestBlock = this.bot.blockAt(chest.position)
      const window = await this.bot.openChest(chestBlock)

      const contents = []
      for (const item of window.containerItems()) {
        contents.push({
          type: item.type,
          name: item.name,
          count: item.count,
          slot: item.slot
        })
      }

      this.knownChests.set(chest.position.toString(), {
        position: chest.position,
        contents: contents,
        lastScanned: Date.now()
      })

      window.close()
      
      console.log(`[STORAGE] Scanned chest at ${chest.position}`)
      return contents
      
    } catch (error) {
      console.error('[STORAGE] Error scanning chest:', error.message)
      return []
    }
  }

  async depositItems(chest, items) {
    try {
      const chestBlock = this.bot.blockAt(chest.position)
      const window = await this.bot.openChest(chestBlock)

      for (const item of items) {
        await window.deposit(item.type, null, item.count)
      }

      window.close()
      console.log(`[STORAGE] Deposited items to ${chest.position}`)
      return true
      
    } catch (error) {
      console.error('[STORAGE] Error depositing:', error.message)
      return false
    }
  }

  async withdrawItems(chest, itemType, count) {
    try {
      const chestBlock = this.bot.blockAt(chest.position)
      const window = await this.bot.openChest(chestBlock)

      const item = window.findInventoryItem(itemType)
      if (item) {
        await window.withdraw(item.type, null, count)
      }

      window.close()
      console.log(`[STORAGE] Withdrew ${count}x ${itemType}`)
      return true
      
    } catch (error) {
      console.error('[STORAGE] Error withdrawing:', error.message)
      return false
    }
  }

  async findItemInStorage(itemType) {
    // Search all known chests for item
    for (const [pos, chestData] of this.knownChests) {
      const found = chestData.contents.find(item => 
        item.name.includes(itemType) || item.type === itemType
      )
      
      if (found) {
        return {
          chest: chestData.position,
          item: found
        }
      }
    }
    
    return null
  }

  async autoOrganize() {
    // Organize items across available chests
    const chests = resourceLocator.findStorage(48)
    
    if (chests.length === 0) return

    // Define organization rules
    const categories = {
      weapons: ['sword', 'axe', 'bow'],
      tools: ['pickaxe', 'shovel', 'hoe'],
      armor: ['helmet', 'chestplate', 'leggings', 'boots'],
      food: ['beef', 'porkchop', 'bread', 'apple'],
      materials: ['log', 'cobblestone', 'iron_ingot', 'diamond']
    }

    // Implement organization logic...
    // This is a simplified example
    for (const chest of chests.slice(0, 5)) {
      await this.scanChest(chest)
    }
  }
}

const storageManager = new StorageManager(bot)
```

---

## 🧪 Testing Your Plugin Integration

### Create a test file:

```javascript
// test_plugins.js

async function testPlugins() {
  console.log('=== Plugin Test Suite ===')

  // Test 1: Pathfinding
  console.log('\n[TEST] Pathfinding...')
  try {
    const goal = new Goals.GoalNear(0, 64, 0, 2)
    bot.pathfinder.setGoal(goal)
    console.log('✓ Pathfinding working')
  } catch (error) {
    console.log('✗ Pathfinding failed:', error.message)
  }

  // Test 2: PVP Plugin
  console.log('\n[TEST] PVP Plugin...')
  try {
    const target = bot.nearestEntity(e => e.type === 'mob')
    if (target) {
      bot.pvp.attack(target)
      await sleep(1000)
      bot.pvp.stop()
      console.log('✓ PVP plugin working')
    } else {
      console.log('⚠ No targets to test PVP')
    }
  } catch (error) {
    console.log('✗ PVP failed:', error.message)
  }

  // Test 3: Auto-eat
  console.log('\n[TEST] Auto-eat...')
  try {
    if (bot.autoEat) {
      console.log('✓ Auto-eat loaded')
    } else {
      console.log('✗ Auto-eat not loaded')
    }
  } catch (error) {
    console.log('✗ Auto-eat failed:', error.message)
  }

  // Test 4: Block Finder
  console.log('\n[TEST] Block Finder...')
  try {
    if (bot.findBlock) {
      const block = bot.findBlock({
        matching: b => b.name === 'dirt',
        maxDistance: 16
      })
      console.log(block ? '✓ Block finder working' : '⚠ No blocks found')
    } else {
      console.log('✗ Block finder not loaded')
    }
  } catch (error) {
    console.log('✗ Block finder failed:', error.message)
  }

  // Test 5: Hawkeye (if available)
  console.log('\n[TEST] Hawkeye...')
  try {
    if (bot.hawkeye) {
      console.log('✓ Hawkeye loaded')
    } else {
      console.log('⚠ Hawkeye not loaded (optional)')
    }
  } catch (error) {
    console.log('⚠ Hawkeye not available')
  }

  console.log('\n=== Test Complete ===')
}

// Run tests after spawn
bot.once('spawn', async () => {
  await sleep(2000)
  await testPlugins()
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Plugin Not Loading
```javascript
// Solution: Check if plugin is properly required and loaded
try {
  const plugin = require('plugin-name')
  bot.loadPlugin(plugin)
  console.log('✓ Plugin loaded successfully')
} catch (error) {
  console.error('✗ Failed to load plugin:', error.message)
  console.log('Try: npm install plugin-name')
}
```

### Issue 2: Version Conflicts
```javascript
// Solution: Check Minecraft version compatibility
const mcData = require('minecraft-data')(bot.version)
console.log('Bot version:', bot.version)
console.log('MC Data version:', mcData.version)

// Some plugins only work with specific versions
// Check plugin documentation for compatibility
```

### Issue 3: Missing Dependencies
```bash
# Solution: Install peer dependencies
npm install --save-peer-dependencies

# Or manually install common dependencies
npm install prismarine-item prismarine-block prismarine-entity
```

### Issue 4: Plugin Conflicts
```javascript
// Solution: Load plugins in correct order
// Some plugins depend on others

// CORRECT ORDER:
bot.loadPlugin(pathfinder)        // 1. Core movement
bot.loadPlugin(collectBlock)      // 2. Block interaction  
bot.loadPlugin(tool)              // 3. Tool selection
bot.loadPlugin(pvp)               // 4. Combat
bot.loadPlugin(armorManager)      // 5. Equipment
bot.loadPlugin(autoeat)           // 6. Survival
bot.loadPlugin(hawkeye)           // 7. Advanced combat

// Custom plugins last
bot.loadPlugin(customPlugin)
```

---

## 📊 Performance Monitoring

```javascript
class PluginPerformanceMonitor {
  constructor() {
    this.metrics = new Map()
  }

  startMeasure(pluginName) {
    this.metrics.set(pluginName, {
      start: performance.now(),
      calls: (this.metrics.get(pluginName)?.calls || 0) + 1
    })
  }

  endMeasure(pluginName) {
    const data = this.metrics.get(pluginName)
    if (!data) return

    const duration = performance.now() - data.start
    const avgTime = data.avgTime || 0
    const calls = data.calls

    data.avgTime = (avgTime * (calls - 1) + duration) / calls
    data.lastDuration = duration
    data.maxDuration = Math.max(data.maxDuration || 0, duration)

    this.metrics.set(pluginName, data)
  }

  getReport() {
    console.log('\n=== Plugin Performance Report ===')
    
    for (const [plugin, data] of this.metrics) {
      console.log(`${plugin}:`)
      console.log(`  Calls: ${data.calls}`)
      console.log(`  Avg: ${data.avgTime.toFixed(2)}ms`)
      console.log(`  Max: ${data.maxDuration.toFixed(2)}ms`)
      console.log(`  Last: ${data.lastDuration.toFixed(2)}ms`)
    }
  }
}

const perfMonitor = new PluginPerformanceMonitor()

// Usage:
async function monitoredFunction() {
  perfMonitor.startMeasure('pathfinding')
  await bot.pathfinder.goto(goal)
  perfMonitor.endMeasure('pathfinding')
}

// Report every 60 seconds
setInterval(() => {
  perfMonitor.getReport()
}, 60000)
```

---

## 🎓 Best Practices

1. **Load plugins in correct order** - Some depend on others
2. **Check plugin documentation** - Each has specific requirements
3. **Test individually** - Isolate issues by testing one plugin at a time
4. **Monitor performance** - Some plugins can be resource-intensive
5. **Keep plugins updated** - Use `npm outdated` to check for updates
6. **Handle errors gracefully** - Wrap plugin calls in try-catch
7. **Use plugin features fully** - Read docs to discover all capabilities
8. **Contribute back** - Report bugs and suggest improvements

---

## 📚 Additional Resources

- [Mineflayer Plugin List](https://github.com/PrismarineJS/mineflayer/blob/master/docs/api.md#plugins)
- [Creating Custom Plugins](https://github.com/PrismarineJS/mineflayer/blob/master/docs/CONTRIBUTING.md)
- [Plugin Development Guide](https://github.com/PrismarineJS/mineflayer/tree/master/examples/plugins)

---

**Happy Bot Building! 🤖**
