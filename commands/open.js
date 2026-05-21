module.exports = (bot) => {

  // =========================
  // 📂 OPEN MENU
  // =========================
  bot.onText(/\/open/, async (msg) => {

    const chatId = msg.chat.id;

    bot.sendMessage(
      chatId,
      "⚔️ Demon Slayer Menu Opened",
      {
        reply_markup: {
          keyboard: [
            [
              { text: "/battle" },
              { text: "/close" }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      }
    );

  });

  // =========================
  // ❌ CLOSE MENU
  // =========================
  bot.onText(/\/close/, async (msg) => {

    const chatId = msg.chat.id;

    bot.sendMessage(
      chatId,
      "❌ Menu Closed",
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    );

  });

};
