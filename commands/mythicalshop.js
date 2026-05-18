const players = require("../data/players");
const mythical = require("../asset/mythical");

module.exports = (bot) => {
  bot.onText(/^\/mythicalshop$/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (!players[userId]) {
      return bot.sendMessage(chatId, "❌ Use /start first");
    }

    let text = "💎 MYTHICAL SHOP 💎\n\n";
    text += `Crystals: ${players[userId].mythicalCrystals || 0}\n\n`;

    mythical.forEach((card) => {
      text += `${card.name}\n`;
      text += `ID: ${card.id}\n`;
      text += `Cost: ${card.cost}\n\n`;
    });

    bot.sendMessage(chatId, text);
  });
};
