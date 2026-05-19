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
        "https://i.pinimg.com/736x/e1/97/3e/e1973e8421e69bc09f731b60f5102d97.jpg",
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
