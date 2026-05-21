console.log("✅ FIXED PLUG-AND-PLAY ASSET CHARACTERS FILE LOADED");

const fs = require("fs");
const path = require("path");

const playerFile = path.join(__dirname, "../data/players.json");

// ADMIN ID CHECK
const ADMIN_ID = "2086993762";

// LOAD CENTRAL CATALOG FILES (PNG SOURCE)
let normalAssets = [];
let mythicalAssets = [];

try { normalAssets = require("../asset/assets"); } catch { normalAssets = []; }
try { mythicalAssets = require("../asset/mythical"); } catch { mythicalAssets = []; }

// Helper function to pull character details from your asset arrays by unique ID
const findCharacterInAssets = (id) => {
  const searchId = id.toString().trim();
  
  // 1. Search Normal Assets
  if (Array.isArray(normalAssets)) {
    const found = normalAssets.find(c => c.id && c.id.toString().trim() === searchId);
    if (found) return { ...found, rarity: "⭐ Normal" };
  }
  
  // 2. Search Mythical Assets
  if (Array.isArray(mythicalAssets)) {
    const found = mythicalAssets.find(c => c.id && c.id.toString().trim() === searchId);
    if (found) return { ...found, rarity: "🔥 MYTHICAL" };
  }
  
  return null;
};

// LOAD & SAVE PLAYERS DB SAFELY
let players = {};
try { players = JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch { players = {}; }
const savePlayers = () => fs.writeFileSync(playerFile, JSON.stringify(players, null, 2));

module.exports = (bot) => {

  // ==========================================
  // 🔨 /addchar [ADMIN COMMAND — LINK ASSET BY ID TO PLAYER]
  // ==========================================
  // Syntax: /addchar PLAYER_ID | CHARACTER_ID
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

    // Find details inside your central assets layers
    const matchedAsset = findCharacterInAssets(charId);

    if (!matchedAsset) {
      return bot.sendMessage(chatId, `❌ **Asset ID \`${charId}\` not found** inside assets.js or mythical.js files! Please check your source IDs.`);
    }

    // Reload live to make sure no data mutation drops out
    try { players = JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch { players = {}; }

    // Init player safely if new account profile
    if (!players[targetPlayerId]) {
      players[targetPlayerId] = {
        coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, lastDaily: 0, mythicalCrystals: 5, rank: "Mizunoto (Rookie)", character: "Not Selected", inventory: []
      };
    }

    if (!players[targetPlayerId].inventory) {
      players[targetPlayerId].inventory = [];
    }

    // Save only string matching references into player profile to avoid file bloating: id|name|type
    const inventoryString = `${matchedAsset.id}|${matchedAsset.name}|${matchedAsset.type || "Breath Style"}`;

    if (players[targetPlayerId].inventory.includes(inventoryString)) {
      return bot.sendMessage(chatId, `⚠️ Player already owns this version of **${matchedAsset.name}**.`);
    }

    players[targetPlayerId].inventory.push(inventoryString);
    savePlayers();

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

    try { players = JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch { players = {}; }

    const player = players[userId];

    if (!player || !player.inventory || player.inventory.length === 0) {
      return bot.sendMessage(chatId, "❌ Your character inventory is empty!");
    }

    let text = "📦 **YOUR PERSONAL SQUAD INVENTORY**\n\n";
    let buttons = [];

    player.inventory.forEach(c => {
      const [id, name, type] = c.split("|");
      
      // Look up assets dynamically to attach accurate tier display tags
      const assetMeta = findCharacterInAssets(id);
      const tierTag = assetMeta ? assetMeta.rarity : "⭐ Standard";

      text += `🆔 \`${id}\` — **${name}** [${tierTag}]\n`;

      // Build row button for each individual collection card item
      buttons.push([
        {
          text: `🖼 View ${name} (${id})`,
          callback_data: `viewcard|${id}`
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
  // 🔘 INLINE VIEW CARD HANDLER (RENDERS REAL PNG LINK)
  // ==========================================
  bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!data.startsWith("viewcard|")) return;

    const [, id] = data.split("|");
    const assetMeta = findCharacterInAssets(id);

    if (!assetMeta || !assetMeta.image) {
      return bot.sendMessage(chatId, "❌ Could not pull card asset PNG link from configuration modules.");
    }

    // Sends the clean character card artwork live directly from your asset files mapping
    bot.sendPhoto(chatId, assetMeta.image, {
      caption: `⚔️ **Name:** ${assetMeta.name}\n✨ **Tier:** ${assetMeta.rarity}\n📁 **Type:** ${assetMeta.type || "Breath Style"}\n🆔 **Asset ID:** \`${assetMeta.id}\``,
      parse_mode: "Markdown"
    });

    bot.answerCallbackQuery(query.id);
  });

};
