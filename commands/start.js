const players = require("../data/players");

module.exports = (bot) => {

  // =========================
  // CHARACTER IMAGES
  // =========================
  const TANJIRO_IMG =
    "https://i.pinimg.com/736x/76/a4/70/76a4709eac7234aaa6726c4efa40cbb9.jpg";

  const NEZUKO_IMG =
    "https://i.pinimg.com/736x/6c/02/c9/6c02c93d3991470183f6c169d1adc64e.jpg";

  // =========================
  // START COMMAND
  // =========================
  bot.onText(/^\/start$/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // Player Data
    if (!players[userId]) {
      players[userId] = {
        coins: 1000,
        gems: 0,
        mythicalCrystals: 5,
        cards: [],
        gender: null,
        character: null
      };
    }

    try {

      await bot.sendPhoto(
        chatId,
        "https://i.pinimg.com/736x/e1/97/3e/e1973e8421e69bc09f731b60f5102d97.jpg",
        {
          caption: `
⚔️ *WELCOME TO DEMON SLAYER BOT* ⚔️

Choose Your Character Path 👇
`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "👦 Tanjiro Beginning",
                  callback_data: "tanjio_biginning"
                }
              ],
              [
                {
                  text: "👧 Nezuko Beginning",
                  callback_data: "nezuko_beginning"
                }
              ]
            ]
          }
        }
      );

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "Error aa gaya 😓");
    }

  });

  // =========================
  // CALLBACKS
  // =========================
  bot.on("callback_query", async (query) => {

    const data = query.data;
    const chatId = query.message.chat.id;
    const userId = query.from.id.toString();

    // =========================
    // TANJIRO BEGINNING
    // =========================
    if (data === "tanjio_bigining") {

      players[userId].character = "Tanjiro Beginning";

      await bot.sendPhoto(
        chatId,
        TANJIRO_IMG,
        {
          caption: `
🔥 *TANJIRO BEGINNING SELECTED* 🔥

👦 Character: *Tanjiro*
🪙 Coins: *1000*
💎 Gems: *0*
🔮 Mythical Crystals: *5*

⚔️ Your Journey Starts Now...
`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🌐 View Tanjiro",
                  url: "https://kimetsu-no-yaiba.fandom.com/wiki/Tanjiro_Kamado"
                }
              ]
            ]
          }
        }
      );

      return bot.answerCallbackQuery(query.id, {
        text: "Tanjiro Beginning Selected!"
      });
    }

    // =========================
    // NEZUKO BEGINNING
    // =========================
    if (data === "nezuko_begining") {

      players[userId].character = "Nezuko Beginning";

      await bot.sendPhoto(
        chatId,
        NEZUKO_IMG,
        {
          caption: `
🌸 *NEZUKO BEGINNING SELECTED* 🌸

👧 Character: *Nezuko*
🪙 Coins: *1000*
💎 Gems: *0*
🔮 Mythical Crystals: *5*

🩸 Demon Journey Begins...
`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🌐 View Nezuko",
                  url: "https://kimetsu-no-yaiba.fandom.com/wiki/Nezuko_Kamado"
                }
              ]
            ]
          }
        }
      );

      return bot.answerCallbackQuery(query.id, {
        text: "Nezuko Beginning Selected!"
      });
    }

  });

};
