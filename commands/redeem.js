const players = require("../data/players");
const mythical = require("../asset/mythical");

module.exports = (bot) => {
  bot.onText(/^\/redeem (.+)$/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const cardId = match[1].trim();

    if (!players[userId]) {
      return bot.sendMessage(chatId, "❌ Use /start first");
    }

    const player = players[userId];
    const card = mythical.find(card => card.id === cardId);

    if (!card) {
      return bot.sendMessage(chatId, "❌ Invalid card ID");
    }

    if (!player.mythicalCrystals) player.mythicalCrystals = 10;
    if (!player.cards) player.cards = [];

    if (player.mythicalCrystals < card.cost) {
      return bot.sendMessage(chatId, "❌ Not enough crystals");
    }

    player.mythicalCrystals -= card.cost;
    player.cards.push(card);

    bot.sendMessage(
      chatId,
      `✅ Redeemed ${card.name}\nRemaining Crystals: ${player.mythicalCrystals}`
    );
  });
};
