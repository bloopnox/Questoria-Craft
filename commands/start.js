const players = require("../data/players");

module.exports = (bot) => {
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (!players[userId]) {
      players[userId] = {
        coins: 1000,
        gems: 0,
        mythicalCrystals: 5,
        cards: []
      };
    }

    try {
      await bot.sendPhoto(
        chatId,
        "https://kommodo.ai/i/ip5xqtnqGqXGpuQxOpkZ",
        {
          caption: "⚔️ WELCOME TO DEMON SLAYER BOT ⚔️"
        }
      );
    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "Error aa gaya 😓");
    }
  });
};
