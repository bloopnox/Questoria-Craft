console.log("⚔️ INTERACTIVE PROFILE SYSTEM ONLINE (VELIX OS V2)");

const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "../data");
const playerFile = path.join(dataDir, "players.json");
const guildFile = path.join(dataDir, "guild.json");

const safeReadJSON = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (e) {
    console.error(`⚠️ DB read warning:`, e.message);
  }
  return {};
};

module.exports = (bot) => {
  
  bot.onText(/\/profile/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const username = msg.from.first_name || "VELIX";

    const players = safeReadJSON(playerFile);
    const guilds = safeReadJSON(guildFile);

    const stats = players[userId] || { coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, characters: [] };
    const userGuild = stats.guildId && guilds[stats.guildId] ? guilds[stats.guildId].name : "No Guild Joined";

    // ✅ Naya Image URL update kar diya hai
    const profileImageUrl = "https://i.pinimg.com/736x/52/f5/97/52f597b5ed03c1f59f54aa656be46c7d.jpg";

    const mainCaption = 
`⚔️ **SLAYER MAIN PROFILE**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **NAME :** \`${username.toUpperCase()}\`
🆔 **ID   :** \`${userId}\`
🏰 **GUILD:** \`${userGuild}\`
━━━━━━━━━━━━━━━━━━━━━━━━
📈 **RANK LEVEL :** \`Lvl ${stats.level}\`
🧪 **EXPERIENCE :** \`${stats.xp} XP\`
━━━━━━━━━━━━━━━━━━━━━━━━
*Use the buttons below to check your inventory and characters!*`;

    try {
      await bot.sendPhoto(chatId, profileImageUrl, {
        caption: mainCaption,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🎒 Inventory & Tokens", callback_data: `inv_${userId}` },
              { text: "👑 Characters", callback_data: `char_${userId}` }
            ],
            [
              { text: "🏰 Guild Details", callback_data: `gld_${userId}` },
              { text: "🔄 Main Menu", callback_data: `main_${userId}` }
            ]
          ]
        }
      });
    } catch (err) {
      console.error("🔥 Profile Delivery Failed:", err.message);
    }
  });

  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
    const clickerId = query.from.id.toString();
    const [action, targetUserId] = data.split("_");

    if (clickerId !== targetUserId) {
      return bot.answerCallbackQuery(query.id, {
        text: "❌ This profile does not belong to you!",
        show_alert: true
      });
    }

    const players = safeReadJSON(playerFile);
    const guilds = safeReadJSON(guildFile);
    const stats = players[targetUserId] || { coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, characters: [] };
    const username = query.from.first_name || "VELIX";

    let updatedCaption = "";

    if (action === "inv") {
      updatedCaption = 
`🎒 **SLAYER INVENTORY**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **OWNER:** \`${username.toUpperCase()}\`
━━━━━━━━━━━━━━━━━━━━━━━━
💰 **SLAYER COINS :** \`${stats.coins} 🪙\`
💎 **SLAYER TOKENS:** \`${stats.tokens || 0} 🎴\`

*Use tokens in the shop to purchase premium card packs!*`;

    } else if (action === "char") {
      const charList = stats.characters && stats.characters.length > 0 
        ? stats.characters.map((c, i) => `${i + 1}. 🃏 \`${c}\``).join("\n")
        : "_No character cards found. Generate or trade cards to collect more!_";

      updatedCaption = 
`👑 **MY CHARACTERS COLLECTION**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **OWNER:** \`${username.toUpperCase()}\`
📊 **TOTAL:** \`${stats.characters ? stats.characters.length : 0} Cards\`
━━━━━━━━━━━━━━━━━━━━━━━━
${charList}
━━━━━━━━━━━━━━━━━━━━━━━━`;

    } else if (action === "gld") {
      const hasGuild = stats.guildId && guilds[stats.guildId];
      const guildName = hasGuild ? guilds[stats.guildId].name : "No Guild Joined";
      const guildLeader = hasGuild ? (guilds[stats.guildId].leader || "Unknown") : "None";
      const guildMembers = hasGuild && guilds[stats.guildId].members ? guilds[stats.guildId].members.length : 0;

      updatedCaption = 
`🏰 **GUILD ASSOCIATION DATA**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **PLAYER :** \`${username.toUpperCase()}\`
━━━━━━━━━━━━━━━━━━━━━━━━
🏰 **GUILD NAME :** \`${guildName}\`
👑 **LEADER     :** \`${guildLeader}\`
👥 **MEMBERS    :** \`${guildMembers} Slayers\`

*Complete guild quests to level up your clan!*`;

    } else if (action === "main") {
      const userGuild = stats.guildId && guilds[stats.guildId] ? guilds[stats.guildId].name : "No Guild Joined";
      updatedCaption = 
`⚔️ **SLAYER MAIN PROFILE**
━━━━━━━━━━━━━━━━━━━━━━━━
👤 **NAME :** \`${username.toUpperCase()}\`
🆔 **ID   :** \`${targetUserId}\`
🏰 **GUILD:** \`${userGuild}\`
━━━━━━━━━━━━━━━━━━━━━━━━
📈 **RANK LEVEL :** \`Lvl ${stats.level}\`
🧪 **EXPERIENCE :** \`${stats.xp} XP\`
━━━━━━━━━━━━━━━━━━━━━━━━
*Use the buttons below to check your inventory and characters!*`;
    }

    try {
      await bot.editMessageCaption(updatedCaption, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🎒 Inventory & Tokens", callback_data: `inv_${targetUserId}` },
              { text: "👑 Characters", callback_data: `char_${targetUserId}` }
            ],
            [
              { text: "🏰 Guild Details", callback_data: `gld_${targetUserId}` },
              { text: "🔄 Main Menu", callback_data: `main_${targetUserId}` }
            ]
          ]
        }
      });
      bot.answerCallbackQuery(query.id);
    } catch (err) {
      console.error("🔥 Button Action Failed:", err.message);
    }
  });
};
