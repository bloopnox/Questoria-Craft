const players = require("../data/players");
const mythical = require("../asset/mythical");

module.exports = (bot) => {
  bot.onText(/^\/mythicalshop$/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (!players[userId]) {
      return bot.sendMessage(chatId, "❌ Use /start first.");
    }

    const crystals = players[userId].mythicalCrystals || 0;

    let text = `💎 <b>MYTHICAL SHOP</b> 💎\n`;
    text += `━━━━━━━━━━━━━━\n`;
    text += `💠 Crystals: <b>${crystals}</b>\n\n`;

    mythical.forEach((card, index) => {
      text += `<b>${index + 1}. ${card.name}</b>\n`;
      text += `⚔️ Power: ${card.power}\n`;
      text += `💠 Cost: ${card.cost}\n`;
      text += `🆔 ${card.id}\n\n`;
    });

    bot.sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: mythical.map((card) => [
          {
            text: `🖼 ${card.name}`,
            callback_data: `view_${card.id}`
          }
        ])
      }
    });
  });

  bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith("view_")) {
      const cardId = data.replace("view_", "");

      const card = mythical.find((c) => c.id === cardId);
      if (!card) return;

      bot.sendPhoto(chatId, card.image, {
        caption:
          `🎴 ${card.name}\n` +
          `⚔️ Power: ${card.power}\n` +
          `💠 Cost: ${card.cost}`
      });
    }
  });
};
