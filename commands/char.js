console.log("✅ UPGRADED MULTI-ASSET CHARACTER SYSTEM LOADED");

const fs = require("fs");
const path = require("path");

// LOAD BOTH ASSET FILES
let normalAssets = [];
let mythicalAssets = [];

try {
  normalAssets = require("../asset/assets");
} catch {
  // If it's a JSON file or needs standard parsing
  const normalPath = path.join(__dirname, "../asset/assets);
  if (fs.existsSync(normalPath)) normalAssets = JSON.parse(fs.readFileSync(normalPath, "utf8"));
}

try {
  mythicalAssets = require("../asset/mythical");
} catch {
  const mythicalPath = path.join(__dirname, "../asset/mythical");
  if (fs.existsSync(mythicalPath)) mythicalAssets = JSON.parse(fs.readFileSync(mythicalPath, "utf8"));
}

module.exports = (bot) => {

  // Helper function to pull everything together live with clear Rarity tags
  const getAllCharacters = () => {
    const combined = [];

    // Process Normal Assets
    if (Array.isArray(normalAssets)) {
      normalAssets.forEach(c => {
        combined.push({
          id: c.id ? c.id.toString() : `N-${c.name}`,
          name: c.name,
          image: c.image || "https://i.imgur.com/fallback.jpg",
          type: c.type || "Standard",
          rarity: "⭐ Normal"
        });
      });
    }

    // Process Mythical Assets
    if (Array.isArray(mythicalAssets)) {
      mythicalAssets.forEach(c => {
        combined.push({
          id: c.id ? c.id.toString() : `M-${c.name}`,
          name: c.name,
          image: c.image || "https://i.imgur.com/fallback.jpg",
          type: c.type || "Mythical breathing style",
          rarity: "🔥 MYTHICAL"
        });
      });
    }

    return combined;
  };

  // ==========================================
  // 📦 /char (LIST ALL SYSTEMS)
  // ==========================================
  bot.onText(/\/char$/, (msg) => {
    const chatId = msg.chat.id;
    const allChars = getAllCharacters();

    if (allChars.length === 0) {
      return bot.sendMessage(chatId, "❌ No characters found inside asset files.");
    }

    let text = "📦 **All Available Characters**\n\n";
    allChars.forEach(c => {
      text += `🆔 \`${c.id}\` — **${c.name}** [${c.rarity}]\n`;
    });

    text += "\nℹ️ *Type `/char [name]` or `/char [id]` to view the dynamic photo card!*";
    bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  });

  // ==========================================
  // 🔎 /char [SEARCH WITH MULTI-RARITY DETECTION]
  // ==========================================
  bot.onText(/\/char (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1].toLowerCase().trim();
    const allChars = getAllCharacters();

    // Match by absolute unique ID string or check if name includes query phrase
    const results = allChars.filter(c => 
      c.id.toLowerCase() === query || 
      c.name.toLowerCase().includes(query)
    );

    if (results.length === 0) {
      return bot.sendMessage(chatId, `❌ No character variation found matching "**${match[1]}**".`);
    }

    // If exactly 1 match (like using exact ID) -> Send photo directly
    if (results.length === 1) {
      const c = results[0];
      return bot.sendPhoto(chatId, c.image, {
        caption: `🆔 **ID:** \`${c.id}\`\n⚔️ **Name:** ${c.name}\n✨ **Rarity:** ${c.rarity}\n📁 **Style:** ${c.type}`,
        parse_mode: "Markdown"
      });
    }

    // If multiple variations found (e.g., searching "Tanjiro" brings back normal AND mythical)
    let buttons = [];
    results.forEach(c => {
      buttons.push([
        {
          text: `[${c.rarity}] ${c.name} (${c.type})`,
          callback_data: `assetchar|${c.id}`
        }
      ]);
    });

    bot.sendMessage(chatId, `🔎 **Multiple tiers found for "${match[1]}". Choose your version:**`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  });

  // ==========================================
  // 🔘 INLINE INTERACTION HANDLER 
  // ==========================================
  bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!data.startsWith("assetchar|")) return;

    const [, id] = data.split("|");
    const allChars = getAllCharacters();
    const char = allChars.find(c => c.id === id);

    if (!char) {
      return bot.sendMessage(chatId, "❌ Character record not found.");
    }

    bot.sendPhoto(chatId, char.image, {
      caption: `🆔 **ID:** \`${char.id}\`\n⚔️ **Name:** ${char.name}\n✨ **Rarity:** ${char.rarity}\n📁 **Style:** ${char.type}`,
      parse_mode: "Markdown"
    });

    bot.answerCallbackQuery(query.id);
  });

};
