console.log("✅ SYSTEM GUIDE FILE LOADED");

module.exports = (bot) => {

  // =========================
  // GUIDE COMMAND
  // =========================
  bot.onText(/\/guide/, (msg) => {
    const chatId = msg.chat.id;

    const image = "https://i.pinimg.com/1200x/84/cd/f4/84cdf4c009b58718595e9e0998def838.jpg"; 

    const caption = 
`📘 **DEMON SLAYER SYSTEM GUIDE**

🏰 **Create Guild:**
/createguild <name>

👥 **Join Guild:**
/joinguild <name>

🏦 **Personal Deposit:**
/deposit <amount> or /deposit all

🏰 **Guild Vault Contribution:**
/guildvault <amount> or /guildvault all

🏆 **Leaderboard:**
/guildlb

🔥 *Click the buttons below to see instant instructions!*`;

    bot.sendPhoto(chatId, image, {
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🏰 Join Guide", callback_data: "g_join" },
            { text: "💰 Bank Guide", callback_data: "g_deposit" }
          ],
          [
            { text: "🏦 Vault Guide", callback_data: "g_vault" },
            { text: "🏆 Leaderboard Info", callback_data: "g_lb" }
          ]
        ]
      }
    });
  });

  // =========================
  // BUTTON HANDLER (FLASH ALERT CODES)
  // =========================
  bot.on("callback_query", (q) => {
    const data = q.data;

    // Direct check to ensure this handler only triggers for guide buttons
    if (!data.startsWith("g_")) return;

    let text = "";

    if (data === "g_join") {
      text = "🏰 Join Guild:\nUse: /joinguild <guild name>\n\nMake sure spelling matches exactly with the guild creator's text!";
    }

    if (data === "g_deposit") {
      text = "👛 Personal Bank Deposit:\nUse: /deposit 100\nOR: /deposit coins 100\nOR: /deposit all\n\nThis moves wallet coins safely to your bank tokens account!";
    }

    if (data === "g_vault") {
      text = "🏰 Guild Vault Contribution:\nUse: /guildvault 500\nOR: /guildvault all\n\nThis adds coins directly to your Guild's shared vault balance!";
    }

    if (data === "g_lb") {
      text = "🏆 Guild Leaderboard:\nUse: /guildlb\n\nRankings are automatically updated live based on total vault coin balances!";
    }

    // show_alert: true se chat me text message nahi jayega, user ki screen par ek popup box open hoga!
    bot.answerCallbackQuery(q.id, {
      text: text,
      show_alert: true
    });
  });

};
