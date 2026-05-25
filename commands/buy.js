/**
 * VELIX OS V2.5 | ARSENAL PROCUREMENT ENGINE (BUY SYSTEM)
 * Fully Synchronized with Centralized Ledger & Inventory Array
 * Group-Safe Execution Lock & Concurrency Mitigation Gates
 */

const weapons = require("../asset/weapons.js");

console.log("🛒 [LOADED SUCCESS] Arsenal Shop Procurement Matrix Online: buy.js");

module.exports = (bot) => {

  // ==========================================
  // 🛒 /buy - ARSENAL CATALOGUE DISPLAY
  // ==========================================
  bot.onText(/^\/buy$/, async (msg) => {
    const chatId = msg.chat.id;

    let shopText = `🛒 **VELIX OS | ARSENAL PROCUREMENT STATION**\n` +
                   `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                   `Equip your division with specialized anti-demon tactical gear:\n\n`;

    weapons.forEach((weapon) => {
      shopText += `⚔️ **[ID: ${weapon.id}] ${weapon.name}**\n` +
                  `   🔹 Lethality Rating: \`+${weapon.damage} DMG\`\n` +
                  `   └ 🪙 Cost Investment: \`${(weapon.price || 0).toLocaleString()}\` Crow Coins\n\n`;
    });

    shopText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `👉 *To initialize acquisition protocol, execute:* \`/buy <weapon_id>\``;

    bot.sendMessage(chatId, shopText, { parse_mode: "Markdown" }).catch(e => console.error(e.message));
  });

  // ==========================================
  // 💳 /buy [weapon_id] - ISOLATED TRANSACTION GATE
  // ==========================================
  bot.onText(/\/buy\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString(); // Enforced unique user boundary verification
    const weaponId = parseInt(match[1], 10);

    // Pull profile layers from the unified centralized ledger hook
    const player = bot.getPlayerData ? bot.getPlayerData(userId) : null;
    if (!player) return; // Silent suppression if core schema mapping is unvouched

    // Strict structural fallback assertions
    if (player.coins === undefined) player.coins = player.gold || 0; // Seamless currency bridge
    if (!player.inventory || !Array.isArray(player.inventory)) player.inventory = [];

    if (isNaN(weaponId)) {
      return bot.sendMessage(chatId, "❌ **System Parsing Error:** Procurement index argument must be a valid weapon ID integer.");
    }

    const weapon = weapons.find((w) => w.id === weaponId);
    if (!weapon) {
      return bot.sendMessage(chatId, "❌ **Registry Error:** Specified weapon framework index does not exist inside asset manifests.");
    }

    // Ledger balance restriction gate
    if (player.coins < weapon.price) {
      return bot.sendMessage(
        chatId, 
        `❌ **Transaction Blocked:** Operational capital parameters are insufficient for this transaction.\n` +
        `📦 **Required Investment:** 🪙 \`${weapon.price.toLocaleString()}\` Coins\n` +
        `🪙 **Your Liquid Reserves:** 🪙 \`${player.coins.toLocaleString()}\` Coins`
      );
    }

    // Check if player already owns this exact structural weapon instance to prevent duplicates if necessary
    const alreadyOwns = player.inventory.some(item => {
      let name = typeof item === "string" ? item : (item.name || "");
      return name.toLowerCase() === weapon.name.toLowerCase();
    });

    if (alreadyOwns) {
      return bot.sendMessage(chatId, `ℹ️ **Asset Redundancy:** Weapon structure \`${weapon.name}\` is already registered inside your storage manifests.`);
    }

    // Atomic modification sequence
    player.coins -= weapon.price;
    
    // Inject weapon item as a clean data object structure to support future modification loops
    player.inventory.push({
      id: `weapon_${weapon.id}`,
      name: weapon.name,
      type: "weapon",
      damage: weapon.damage,
      purchasedAt: new Date().toISOString()
    });

    // Save state update down into primary ledger pipeline
    if (bot.savePlayerData) {
      bot.savePlayerData(userId, player);
    }

    bot.sendMessage(
      chatId,
      `✅ **VELIX OS | PROCUREMENT CONFIRMED**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Weapon mainframe successfully integrated into your personal manifest.\n\n` +
      `⚔️ **Acquired Weapon:** \`${weapon.name}\`\n` +
      `🪙 **Remaining Capital:** 🪙 \`${player.coins.toLocaleString()}\` Coins\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Execute \`/equip weapon_${weapon.id}\` to route lethal output parameters into your active profile combat slot.*`,
      { parse_mode: "Markdown" }
    );
  });

};
