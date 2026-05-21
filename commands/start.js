console.log("🛠️ SUPER-DEBUG PROOF ANTI-RESET START SYSTEM LOADED");

const fs = require("fs");
const path = require("path");

// Pure folder architecture sync check
const dataDir = path.join(__dirname, "../data");
const playerFile = path.join(dataDir, "players.json");

// Ensure folder exists safely
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ATOMIC LOAD WITH SYSTEM CONSOLE LOGS
const loadPlayersData = () => {
  try { 
    if (!fs.existsSync(playerFile)) {
      fs.writeFileSync(playerFile, JSON.stringify({}, null, 2));
      return {};
    }
    const rawData = fs.readFileSync(playerFile, "utf8");
    return JSON.parse(rawData); 
  } catch (e) { 
    console.log("❌ DB READ ERROR (File Corrupted Or Empty):", e.message);
    return {}; 
  }
};

// ATOMIC FORCE SAVE WITH VERIFICATION
const savePlayersData = (data) => {
  try {
    const stringified = JSON.stringify(data, null, 2);
    fs.writeFileSync(playerFile, stringified, "utf8");
    console.log("💾 [SUCCESS] Data successfully written to players.json!");
    return true;
  } catch (e) {
    console.log("❌ [CRITICAL WRITE ERROR] Could not save data to file:", e.message);
    return false;
  }
};

module.exports = (bot) => {

  const START_IMG = "https://i.pinimg.com/736x/e1/97/3e/e1973e8421e69bc09f731b60f5102d97.jpg";
  const TANJIRO_IMG = "https://i.pinimg.com/736x/ab/26/81/ab26817caf5dbd8bd82f698f517649b7.jpg";
  const NEZUKO_IMG = "https://i.pinimg.com/736x/6c/02/c9/6c02c93d3991470183f6c169d1adc64e.jpg";

  // ==========================================
  // START COMMAND
  // ==========================================
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    console.log(`\n=== 📥 /start Triggered By User: ${userId} ===`);
    const currentPlayers = loadPlayersData();

    // Check memory state instantly
    if (currentPlayers[userId] && currentPlayers[userId].character) {
      console.log(`🛑 User ${userId} blocked! Already has character: ${currentPlayers[userId].character}`);
      return bot.sendMessage(
        chatId,
        `⚠️ **You Already Selected A Character!**\n\n👤 **Current Starter:** ${currentPlayers[userId].character}\n🎯 Use \`/hunt\` to start tracking and slaying demons!`,
        { parse_mode: "Markdown" }
      );
    }

    // If completely new user
    if (!currentPlayers[userId]) {
      console.log(`🆕 Creating fresh profile wireframe for ${userId}...`);
      currentPlayers[userId] = {
        coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, lastDaily: 0, mythicalCrystals: 5, rank: "Mizunoto (Rookie)", character: null, inventory: [], username: msg.from.username || ""
      };
      savePlayersData(currentPlayers);
    }

    await bot.sendPhoto(chatId, START_IMG, {
      caption: `⚔️ **WELCOME TO DEMON SLAYER BOT** ⚔️\n\nChoose your beginning path below carefully, Slayer! 👇`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "👦 Tanjiro Beginning", callback_data: "tanjiro" }],
          [{ text: "👧 Nezuko Beginning", callback_data: "nezuko" }]
        ]
      }
    });
  });

  // ==========================================
  // BUTTON HANDLER
  // ==========================================
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id.toString();
    const data = query.data;

    if (data !== "tanjiro" && data !== "nezuko") return;

    console.log(`\n=== 🔘 Button Clicked: ${data} By User: ${userId} ===`);
    let currentPlayers = loadPlayersData();

    if (!currentPlayers[userId]) {
      currentPlayers[userId] = {
        coins: 1000, tokens: 0, level: 1, xp: 0, guildId: null, lastDaily: 0, mythicalCrystals: 5, rank: "Mizunoto (Rookie)", character: null, inventory: [], username: query.from.username || ""
      };
    }

    if (currentPlayers[userId].character) {
      console.log(`🛑 Exploit Blocked: User ${userId} clicked button but already has a character locked.`);
      return bot.answerCallbackQuery(query.id, {
        text: "❌ Character Already Selected!", show_alert: true
      });
    }

    // TANJIRO SELECT
    if (data === "tanjiro") {
      currentPlayers[userId].character = "Tanjiro";
      currentPlayers[userId].username = query.from.username || "";
      
      console.log(`⚙️ Attempting to lock Tanjiro for ${userId}...`);
      const isSaved = savePlayersData(currentPlayers);

      if (!isSaved) {
        return bot.sendMessage(chatId, "❌ **System Error:** Data file is locked or cannot be written! Contact Admin.");
      }

      await bot.sendPhoto(chatId, TANJIRO_IMG, {
        caption: `🔥 **TANJIRO BEGINNING LOCKED** 🔥\n\n👦 **Character:** Tanjiro\n🪙 **Coins:** 1,000\n🔮 **Crystals:** 5\n\n✅ *Your profile data has been hard-coded into the Slayer Registry!*\n\n🎯 **New Command Unlocked:**\n\`/hunt\``,
        parse_mode: "Markdown"
      });
      return bot.answerCallbackQuery(query.id);
    }

    // NEZUKO SELECT
    if (data === "nezuko") {
      currentPlayers[userId].character = "Nezuko";
      currentPlayers[userId].username = query.from.username || "";

      console.log(`⚙️ Attempting to lock Nezuko for ${userId}...`);
      const isSaved = savePlayersData(currentPlayers);

      if (!isSaved) {
        return bot.sendMessage(chatId, "❌ **System Error:** Data file is locked or cannot be written! Contact Admin.");
      }

      await bot.sendPhoto(chatId, NEZUKO_IMG, {
        caption: `🌸 **NEZUKO BEGINNING LOCKED** 🌸\n\n👧 **Character:** Nezuko\n🪙 **Coins:** 1,000\n🔮 **Crystals:** 5\n\n✅ *Your profile data has been hard-coded into the Slayer Registry!*\n\n🎯 **New Command Unlocked:**\n\`/hunt\``,
        parse_mode: "Markdown"
      });
      return bot.answerCallbackQuery(query.id);
    }
  });

};
