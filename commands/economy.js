const fs = require("fs");
const path = require("path");

const playerFile = path.join(__dirname, "../data/players.json");
const guildFile = path.join(__dirname, "../data/guilds.json");

// LOAD
let players = {};
let guilds = {};

try { players = JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch { players = {}; }
try { guilds = JSON.parse(fs.readFileSync(guildFile, "utf8")); } catch { guilds = {}; }

// SAVE
const savePlayers = () => fs.writeFileSync(playerFile, JSON.stringify(players, null, 2));
const saveGuilds = () => fs.writeFileSync(guildFile, JSON.stringify(guilds, null, 2));

// USER INIT
const getUser = (userId) => {
  if (!players[userId]) {
    players[userId] = {
      coins: 1000,
      tokens: 0,
      level: 1,
      xp: 0,
      guildId: null
    };
    savePlayers();
  }
  return players[userId];
};

// GUILD INIT
const getGuild = (guildId) => {
  if (!guilds[guildId]) {
    guilds[guildId] = {
      name: "Unknown Guild",
      bank: 0
    };
    saveGuilds();
  }
  return guilds[guildId];
};

module.exports = (bot) => {

  // =========================
  // PLAYER DEPOSIT (BANK)
  // =========================
  bot.onText(/\/deposit (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const amount = Number(match[1]);
    const p = getUser(userId);

    if (!amount || amount <= 0) {
      return bot.sendMessage(chatId, "❌ Invalid amount");
    }

    if (p.coins < amount) {
      return bot.sendMessage(chatId, "❌ Not enough coins");
    }

    p.coins -= amount;
    p.tokens += amount;

    savePlayers();

    bot.sendMessage(chatId, `🏦 Deposited ${amount} coins to your bank`);
  });

  // =========================
  // GUILD DEPOSIT
  // =========================
  bot.onText(/\/guilddeposit (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const amount = Number(match[1]);
    const p = getUser(userId);

    if (!amount || amount <= 0) {
      return bot.sendMessage(chatId, "❌ Invalid amount");
    }

    if (!p.guildId) {
      return bot.sendMessage(chatId, "❌ You are not in a guild");
    }

    const g = getGuild(p.guildId);

    if (p.coins < amount) {
      return bot.sendMessage(chatId, "❌ Not enough coins");
    }

    p.coins -= amount;
    g.bank += amount;

    savePlayers();
    saveGuilds();

    bot.sendMessage(
      chatId,
      `🏰 Guild Deposit Successful!\n💰 +${amount} coins added to guild bank\n🏦 Guild Bank: ${g.bank}`
    );
  });

};
