const players = require("../data/players");

module.exports = (bot) => {
  bot.onText(/^\/char (.+)$/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const query = match[1].trim().toLowerCase();

    if (!players[userId]) {
      return bot.sendMessage(chatId, "❌ Use /start first.");
    }

    if (!players[userId].cards) {
      return bot.sendMessage(chatId, "❌ No cards found.");
    }

    const card = players[userId].cards.find(
      (c) => c.id.toLowerCase() === query
    );

    if (!card) {
      return bot.sendMessage(chatId, "❌ Character not owned/found.");
    }

    bot.sendPhoto(chatId, card.image, {
      caption:
        `🎴 ${card.name}\n` +
        `⚔️ Power: ${card.power}`
    });
  });
};
