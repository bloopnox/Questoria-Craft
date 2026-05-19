const players = require("../data/players");

module.exports = (bot) => {

  bot.onText(/\/profile/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const p = players[userId];

    const url = `http://localhost:3000/profile?name=${msg.from.first_name}&coins=${p.coins}&level=${p.level}&rank=${p.rank}`;

    bot.sendPhoto(chatId, url, {
      caption: "👤 Your Custom Profile"
    });

  });

};
