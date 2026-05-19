module.exports = (bot) => {

  // =========================
  // GUIDE COMMAND
  // =========================
  bot.onText(/\/guide/, (msg) => {

    const chatId = msg.chat.id;

    const image = "https://i.pinimg.com/1200x/84/cd/f4/84cdf4c009b58718595e9e0998def838.jpg"; 
    // 👆 apna image URL yaha daal

    const caption = `
📘 *GUILD SYSTEM GUIDE*

🏰 Create Guild:
 /createguild <name>

👥 Join Guild:
 /joinguild <name>

💰 Deposit:
 /deposit coins 100

🏆 Leaderboard:
 /guildlb

⚔️ Upgrade:
 /upgradeguild

🌐 Full Docs below 👇
    `;

    bot.sendPhoto(chatId, image, {
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🏰 Join Guide", callback_data: "g_join" },
            { text: "💰 Deposit Guide", callback_data: "g_deposit" }
          ],
          [
            { text: "🏆 Leaderboard Guide", callback_data: "g_lb" }
          ],
          [
            { text: "🌐 Open Docs", url: "https://example.com/guild-guide" }
          ]
        ]
      }
    });
  });

  // =========================
  // BUTTON HANDLER
  // =========================
  bot.on("callback_query", (q) => {

    const chatId = q.message.chat.id;
    const data = q.data;

    let text = "";

    if (data === "g_join") {
      text = "🏰 Use: /joinguild <guild name>";
    }

    if (data === "g_deposit") {
      text = "💰 Use: /deposit coins 100 OR /deposit tokens 5";
    }

    if (data === "g_lb") {
      text = "🏆 Use: /guildlb to see top guilds";
    }

    bot.sendMessage(chatId, text);
    bot.answerCallbackQuery(q.id);
  });

};
