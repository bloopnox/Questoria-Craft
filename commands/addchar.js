const players = require("../data/player");
const normalCards = require("../asset/assets");
const mythicalCards = require("../asset/mythical");

const allCards = [...normalCards, ...mythicalCards];

const ADMIN_ID = "2086993762";

module.exports = (bot) => {
  bot.onText(/^\/addchar (\d+) (.+)$/, (msg, match) => {
    const senderId = msg.from.id.toString();
    const targetId = match[1];
    const cardId = match[2].trim().toLowerCase();

    if (senderId !== ADMIN_ID) {
      return bot.sendMessage(msg.chat.id, "❌ Admin only command.");
    }

    if (!players[targetId]) {
      return bot.sendMessage(msg.chat.id, "❌ User not found.");
    }

    const card = allCards.find(
      (c) => c.id.toLowerCase() === cardId
    );

    if (!card) {
      return bot.sendMessage(msg.chat.id, "❌ Invalid card id.");
    }

    if (!players[targetId].cards) {
      players[targetId].cards = [];
    }

    players[targetId].cards.push(card);

    bot.sendMessage(
      msg.chat.id,
      `✅ Added ${card.name} to ${targetId}`
    );
  });
};
