const fs = require("fs");

let temp = {};

module.exports = (bot) => {

  // 1️⃣ name lo
  bot.onText(/\/addchar (.+)/, (msg, match) => {
    temp[msg.chat.id] = match[1].toLowerCase();
    bot.sendMessage(msg.chat.id, "📸 Ab image bhejo");
  });

  // 2️⃣ image lo
  bot.on("photo", async (msg) => {
    const chatId = msg.chat.id;

    if (!temp[chatId]) return;

    const name = temp[chatId];

    const fileId = msg.photo[msg.photo.length - 1].file_id;
    const fileLink = await bot.getFileLink(fileId);

    // ⚡ read old data
    let data = {};
    try {
      data = require("../asset/assets");
      delete require.cache[require.resolve("../asset/assets")];
      data = require("../asset/assets");
    } catch (e) {
      data = {};
    }

    // ⚡ save character
    data[name] = {
      name: name,
      img: fileLink,
      rarity: "SSR"
    };

    // ⚡ write file
    fs.writeFileSync(
      "./asset/assets.js",
      "module.exports = " + JSON.stringify(data, null, 2)
    );

    bot.sendMessage(msg.chat.id, "✅ Character saved!");

    delete temp[chatId];
  });

};
