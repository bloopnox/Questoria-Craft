const players = require("../data/players");
const guilds = require("../data/guild");

module.exports = (bot) => {

  // =========================
  // FIND USER GUILD
  // =========================
  const getUserGuild = (userId) => {
    for (let g in guilds) {
      if (guilds[g].members.includes(userId)) {
        return guilds[g];
      }
    }
    return null;
  };

  // =========================
  // CREATE GUILD (PAID)
  // =========================
  bot.onText(/\/createguild (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const name = match[1];

    const p = players[userId];
    if (!p) return bot.sendMessage(chatId, "❌ Profile not found");

    if (getUserGuild(userId)) {
      return bot.sendMessage(chatId, "❌ Already in a guild");
    }

    if (p.coins < 100000 || p.mythicalCrystals < 5) {
      return bot.sendMessage(chatId, "❌ Need 100k coins + 5 mythical crystals");
    }

    // deduct cost
    p.coins -= 100000;
    p.mythicalCrystals -= 5;

    const guildId = "g_" + Date.now();

    guilds[guildId] = {
      name: name,
      leader: userId,
      members: [userId],

      image: "https://i.pinimg.com/736x/ba/cf/fd/bacffdb010bfded61e45378057724c71.jpg",

      vault: {
        coins: 0,
        mythicalTokens: 0
      },

      contributions: {}
    };

    bot.sendMessage(chatId, `🏰 Guild Created: ${name}`);
  });

  // =========================
  // JOIN GUILD
  // =========================
  bot.onText(/\/joinguild (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const name = match[1].toLowerCase();

    if (getUserGuild(userId)) {
      return bot.sendMessage(chatId, "❌ Already in guild");
    }

    for (let g in guilds) {
      if (guilds[g].name.toLowerCase() === name) {

        guilds[g].members.push(userId);

        return bot.sendMessage(chatId, `✅ Joined ${guilds[g].name}`);
      }
    }

    bot.sendMessage(chatId, "❌ Guild not found");
  });

  // =========================
  // MY GUILD (UI + IMAGE)
  // =========================
  bot.onText(/\/myguild/, (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) return bot.sendMessage(chatId, "❌ No guild");

    const isLeader = guild.leader === userId;

    const c = guild.contributions[userId] || {
      coins: 0,
      mythicalTokens: 0
    };

    const caption = `
🏰 *${guild.name}*

👑 Leader: ${guild.leader}
👥 Members: ${guild.members.length}
⭐ Role: ${isLeader ? "Leader" : "Member"}

💰 Vault:
- Coins: ${guild.vault.coins}
- Tokens: ${guild.vault.mythicalTokens}

📜 Your Contribution:
- Coins: ${c.coins}
- Tokens: ${c.mythicalTokens}
    `;

    bot.sendPhoto(chatId, guild.image, {
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "💰 Vault", callback_data: "guild_vault" },
            { text: "📜 My Stats", callback_data: "guild_contrib" }
          ],
          [
            { text: "🏆 Leaderboard (soon)", callback_data: "guild_lb" }
          ]
        ]
      }
    });
  });

  // =========================
  // SIMPLE GUILD INFO
  // =========================
  bot.onText(/\/guild/, (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guild = getUserGuild(userId);

    if (!guild) return bot.sendMessage(chatId, "❌ No guild");

    bot.sendMessage(chatId,
      `🏰 ${guild.name}\n👥 Members: ${guild.members.length}\n💰 Coins: ${guild.vault.coins}`
    );
  });

  // =========================
  // DEPOSIT SYSTEM
  // =========================
  bot.onText(/\/deposit (coins|tokens) (\d+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const type = match[1];
    const amount = parseInt(match[2]);

    const p = players[userId];
    const guild = getUserGuild(userId);

    if (!guild) return bot.sendMessage(chatId, "❌ No guild");
    if (!p) return bot.sendMessage(chatId, "❌ No player");

    if (!guild.contributions[userId]) {
      guild.contributions[userId] = {
        coins: 0,
        mythicalTokens: 0
      };
    }

    if (type === "coins") {

      if (p.coins < amount) return bot.sendMessage(chatId, "❌ Not enough coins");

      p.coins -= amount;
      guild.vault.coins += amount;
      guild.contributions[userId].coins += amount;

    } else {

      if (p.mythicalCrystals < amount) return bot.sendMessage(chatId, "❌ Not enough tokens");

      p.mythicalCrystals -= amount;
      guild.vault.mythicalTokens += amount;
      guild.contributions[userId].mythicalTokens += amount;
    }

    bot.sendMessage(chatId, `💰 Deposited ${amount} ${type}`);
  });

  // =========================
  // WITHDRAW (LEADER ONLY)
  // =========================
  bot.onText(/\/withdraw (coins|tokens) (\d+) (\d+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const type = match[1];
    const amount = parseInt(match[2]);
    const targetUser = match[3];

    const guild = getUserGuild(userId);

    if (!guild) return bot.sendMessage(chatId, "❌ No guild");
    if (guild.leader !== userId) return bot.sendMessage(chatId, "❌ Only leader can withdraw");

    if (!players[targetUser]) return bot.sendMessage(chatId, "❌ User not found");

    if (type === "coins") {

      if (guild.vault.coins < amount) return bot.sendMessage(chatId, "❌ Not enough vault coins");

      guild.vault.coins -= amount;
      players[targetUser].coins += amount;

    } else {

      if (guild.vault.mythicalTokens < amount) return bot.sendMessage(chatId, "❌ Not enough vault tokens");

      guild.vault.mythicalTokens -= amount;
      players[targetUser].mythicalCrystals += amount;
    }

    bot.sendMessage(chatId, `👑 Leader sent ${amount} ${type} to user`);
  });

  // =========================
  // BUTTON HANDLER
  // =========================
  bot.on("callback_query", (query) => {

    const chatId = query.message.chat.id;
    const userId = query.from.id.toString();

    const guild = getUserGuild(userId);
    if (!guild) return;

    let text = "";

    if (query.data === "guild_vault") {
      text = `💰 Vault:\nCoins: ${guild.vault.coins}\nTokens: ${guild.vault.mythicalTokens}`;
    }

    if (query.data === "guild_contrib") {
      const c = guild.contributions[userId] || { coins: 0, mythicalTokens: 0 };
      text = `📜 Your Contribution:\nCoins: ${c.coins}\nTokens: ${c.mythicalTokens}`;
    }

    if (query.data === "guild_lb") {
      text = "🏆 Leaderboard coming soon...";
    }

    bot.sendMessage(chatId, text);
    bot.answerCallbackQuery(query.id);
  });

};
