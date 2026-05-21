const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/players.json");

// LOAD DATA
let players = {};

try {
  players = JSON.parse(fs.readFileSync(file, "utf8"));
} catch {
  players = {};
}

// SAVE FUNCTION
const savePlayers = () => {
  fs.writeFileSync(file, JSON.stringify(players, null, 2));
};

// SAFE USER INIT
const getUser = (userId) => {
  if (!players[userId]) {
    players[userId] = {
      coins: 1000,
      gems: 0,
      tokens: 0,
      level: 1,
      xp: 0
    };
    savePlayers();
  }
  return players[userId];
};

module.exports = (bot) => {

  // BALANCE
  bot.onText(/\/balance/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const p = getUser(userId);

    bot.sendMessage(
      chatId,
      `💰 *YOUR BALANCE*

🪙 Coins: ${p.coins}
💎 Gems: ${p.gems}
🪙 Tokens: ${p.tokens}
📊 Level: ${p.level}
⚡ XP: ${p.xp}`,
      { parse_mode: "Markdown" }
    );
  });

  // DAILY
  bot.onText(/\/daily/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const p = getUser(userId);

    const reward = 500;

    p.coins += reward;
    savePlayers();

    bot.sendMessage(chatId, `🎁 Daily reward: +${reward} coins`);
  });

  // WORK
  bot.onText(/\/work/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const p = getUser(userId);

    const earn = Math.floor(Math.random() * 200) + 50;

    p.coins += earn;
    p.xp += 10;

    if (p.xp >= 100) {
      p.level += 1;
      p.xp = 0;
    }

    savePlayers();

    bot.sendMessage(chatId, `⚔️ You worked and earned ${earn} coins`);
  });

  // DEPOSIT
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
    p.tokens += amount; // bank / deposit wallet

    savePlayers();

    bot.sendMessage(
      chatId,
      `🏦 Deposited ${amount} coins\n💰 Coins: ${p.coins}\n🪙 Tokens: ${p.tokens}`
    );
  });

};
