console.log("✅ BULLETPROOF ASSET SYNC CHARACTER SYSTEM LOADED");

const fs = require("fs");
const path = require("path");

const playerFile = path.join(__dirname, "../data/players.json");

// ADMIN ID CHECK
const ADMIN_ID = "2086993762";

// LOAD CENTRAL CATALOG FILES SAFELY
let normalAssets = [];
let mythicalAssets = [];

try { normalAssets = require("../asset/assets"); } catch { normalAssets = []; }
try { mythicalAssets = require("../asset/mythical"); } catch { mythicalAssets = []; }

// Helper function to pull character details from asset arrays
const findCharacterInAssets = (id) => {
  const searchId = id.toString().trim();
  
  if (Array.isArray(normalAssets)) {
    const found = normalAssets.find(c => c.id && c.id.toString().trim() === searchId);
    if (found) return { ...found, rarity: "⭐ Normal" };
  }
  
  if (Array.isArray(mythicalAssets)) {
    const found = mythicalAssets.find(c => c.id && c.id.toString().trim() === searchId);
    if (found) return { ...found, rarity: "🔥 MYTHICAL" };
  }
  
  return null;
};

// HELPER FUNCTIONS FOR ATOMIC FILE I/O
const loadPlayersData = () => {
  try {
    return JSON.parse(fs.readFileSync(playerFile, "utf8"));
  } catch (e) {
    return {};
  }
};

const savePlayersData = (data) => {
  fs.writeFileSync(playerFile, JSON.stringify(data, null, 2));
};

module.exports = (bot) => {

  // ==========================================
  // 🔨 /addchar [ADMIN COMMAND — LINK ASSET BY ID TO PLAYER]
  // ==========================================
  bot.onText(/\/addchar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const adminUserId = msg.from.id.toString();

    if (adminUserId !== ADMIN_ID) {
      return bot.sendMessage(chatId, "❌ Unauthorized! Only the Head Slayer can grant assets.");
    }

    const input = match[1];
    const parts = input.split("|");

    if (parts.length < 2) {
      return bot.sendMessage(
        chatId,
        "❌ **Incorrect Syntax Format!**\n\nUse: `/addchar PlayerID | CharacterID` \nExample: `/addchar 12345678 | 001`",
        { parse_mode: "Markdown" }
      );
    }

    const targetPlayerId = parts[0].trim();
    const charId = parts[1].trim();

    const matchedAsset = findCharacterInAssets(charId);
    if (!matchedAsset) {
      return bot.sendMessage(chatId, `❌ **Asset ID \`${charId}\` not found** inside assets.js or mythical.js files!`);
    }

    // Atomic Load
    const currentPlayers = loadPlayersData();

    if (!currentPlayers[targetPlayerId]) {
      currentPlayers[targetPlayerId] = {
        coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, lastDaily: 0, mythicalCrystals: 5, rank: "Mizunoto (Rookie)", character: "Not Selected", inventory: []
      };
    }

    if (!currentPlayers[targetPlayerId].inventory) {
      currentPlayers[targetPlayerId].inventory = [];
    }

    const inventoryString = `${matchedAsset.id}|${matchedAsset.name}|${matchedAsset.type || "Breath Style"}`;

    if (currentPlayers[targetPlayerId].inventory.includes(inventoryString)) {
      return bot.sendMessage(chatId, `⚠️ Player already owns this version of **${matchedAsset.name}**.`);
    }

    currentPlayers[targetPlayerId].inventory.push(inventoryString);
    savePlayersData(currentPlayers);

    bot.sendMessage(
      chatId,
      `✅ **Character Successfully Granted from Asset Files!**\n\n👤 **To Player:** \`${targetPlayerId}\`\n🆔 **Character ID:** \`${matchedAsset.id}\`\n⚔️ **Name:** ${matchedAsset.name}\n✨ **Rarity Tier:** ${matchedAsset.rarity}\n📁 **Style:** ${matchedAsset.type || "Breath Style"}`,
      { parse_mode: "Markdown" }
    );
  });


  // ==========================================
  // 📦 /viewchar (PLAYER PERSONAL INVENTORY WITH PHOTO CHANGER)
  // ==========================================
  bot.onText(/\/viewchar/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // Live Read
    const currentPlayers = loadPlayersData();
    const player = currentPlayers[userId];

    if (!player || !player.inventory || player.inventory.length === 0) {
      return bot.sendMessage(chatId, "❌ Your character inventory is empty!");
    }

    let text = "📦 **YOUR PERSONAL SQUAD INVENTORY**\n\n";
    let buttons = [];

    player.inventory.forEach(c => {
      const [id, name, type] = c.split("|");
      const assetMeta = findCharacterInAssets(id);
      const tierTag = assetMeta ? assetMeta.rarity : "⭐ Standard";

      text += `🆔 \`${id}\` — **${name}** [${tierTag}]\n`;

      buttons.push([
        {
          text: `🖼 View ${name} (${id})`,
          callback_data: `viewcard|${userId}|${id}` // Attached userId for security verification
        }
      ]);
    });

    text += "\nℹ️ *Click any button below to instantly pull up your slayer's PNG card artwork!*";

    bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons }
    });
  });


  // ==========================================
  // 🔘 INLINE VIEW CARD HANDLER (SECURE & ATOMIC)
  // ==========================================
  bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const clickingUserId = query.from.id.toString();

    if (!data.startsWith("viewcard|")) return;

    const [, ownerId, id] = data.split("|");

    // SECURITY CHECK: Sirf wahi player button trigger kar sakta hai jiska inventory card hai
    if (clickingUserId !== ownerId) {
      return bot.answerCallbackQuery(query.id, {
        text: "❌ Yeh aapki inventory nahi hai! Apna wallet dekhne ke liye /viewchar use karein.",
        show_alert: true
      });
    }

    // Dynamic Database check to ensure character wasn't traded/removed
    const currentPlayers = loadPlayersData();
    const player = currentPlayers[ownerId];

    if (!player || !player.inventory) {
      return bot.sendMessage(chatId, "❌ Profile error encountered.");
    }

    const hasChar = player.inventory.some(c => c.startsWith(`${id}|`));
    if (!hasChar) {
      return bot.sendMessage(chatId, "❌ Verification Failed: You do not own this card layout anymore.");
    }

    const assetMeta = findCharacterInAssets(id);
    if (!assetMeta || !assetMeta.image) {
      return bot.sendMessage(chatId, "❌ Could not pull card asset PNG link.");
    }

    bot.sendPhoto(chatId, assetMeta.image, {
      caption: `⚔️ **Name:** ${assetMeta.name}\n✨ **Tier:** ${assetMeta.rarity}\n📁 **Type:** ${assetMeta.type || "Breath Style"}\n🆔 **Asset ID:** \`${assetMeta.id}\``,
      parse_mode: "Markdown"
    });

    bot.answerCallbackQuery(query.id);
  });

};
