require("dotenv").config();

console.log("=========================================");
console.log("⚔️  VELIX METADATA ENGINE STARTING...  ⚔️");
console.log("=========================================");

const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// =========================================
// 🌐 SAFE TOKEN VALIDATION GATEWAY
// =========================================
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.log("❌ CRITICAL: BOT_TOKEN is entirely missing from your environment setup!");
  process.exit(1);
}

// =========================================
// 🤖 BOT INITIALIZATION
// =========================================
const bot = new TelegramBot(TOKEN, {
  polling: {
    autoStart: true,
    params: { timeout: 10 }
  }
});

// =========================================
// 📦 GLOBAL ASSET MEMORY BRIDGE (Zero Disk I/O Overload)
// =========================================
try {
  global.VELIX_ASSETS = {
    demons: require("./commands/demons.js"), 
    weapons: require("./commands/weapons.js"), 
    mythical: require("./commands/mythical.js"),
    godTier: require("./commands/godtier.js")
  };
  console.log("✅ [ASSETS SYNCED]: Global Master registries bound to memory stream.");
} catch (assetErr) {
  console.log("⚠️  [ASSET LINK WARNING]: Some asset files were missing during boot sequence:", assetErr.message);
}

// =========================================
// 📂 CENTRALIZED DATABASE SYSTEM (Highly Optimized for 2000+ Users)
// =========================================
const dbPath = path.join(process.cwd(), "data", "players.json");

// Ensure data folder and players.json exist safely
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({}), "utf8");
}

/**
 * Global Helper: Get Player Profile Data cleanly across all command files
 * 🚨 COMPATIBILITY PATCH: Fully integrated with original schema (inventory, xp, mythicalCrystals)
 */
bot.getPlayerData = (userId) => {
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    const json = JSON.parse(data || "{}");
    
    // Default template tailored exactly to merge your original fields smoothly
    if (!json[userId]) {
      json[userId] = {
        username: "Slayer",
        coins: 500,
        bank: 0,
        mythicalCrystals: 0, 
        level: 1,
        xp: 0,               
        character: null,
        inventory: [],       // Stores regular, God-tier, and Mythical Cards
        owned_weapons: [],   // Weapon system array
        equipped_weapon: null,
        essence: 0,
        guildId: null,
        last_daily: 0,
        last_work: 0
      };
      fs.writeFileSync(dbPath, JSON.stringify(json, null, 2), "utf8");
    } else {
      // 🔄 AUTOMATIC RUNTIME PATCHER: Syncs legacy schema with new system requirements
      let structuralUpdate = false;
      
      if (json[userId].inventory === undefined) { json[userId].inventory = json[userId].owned_characters || []; structuralUpdate = true; }
      if (json[userId].xp === undefined) { json[userId].xp = json[userId].exp || 0; structuralUpdate = true; }
      if (json[userId].coins === undefined) { json[userId].coins = 0; structuralUpdate = true; }
      if (json[userId].bank === undefined) { json[userId].bank = 0; structuralUpdate = true; }
      if (json[userId].mythicalCrystals === undefined) { json[userId].mythicalCrystals = 0; structuralUpdate = true; }
      if (json[userId].owned_weapons === undefined) { json[userId].owned_weapons = []; structuralUpdate = true; }
      if (json[userId].equipped_weapon === undefined) { json[userId].equipped_weapon = null; structuralUpdate = true; }
      if (json[userId].essence === undefined) { json[userId].essence = 0; structuralUpdate = true; }
      if (json[userId].last_daily === undefined) { json[userId].last_daily = 0; structuralUpdate = true; }
