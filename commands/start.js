const fs = require("fs");
const path = require("path");
const playerFile = path.join(__dirname, "../data/players.json");

// Helper: Hamesha file se naya data uthayega
const getDB = () => {
    try {
        if (!fs.existsSync(playerFile)) return {};
        return JSON.parse(fs.readFileSync(playerFile, "utf8"));
    } catch (e) { return {}; }
};

// Helper: Hamesha file mein data save karega
const saveDB = (data) => {
    fs.writeFileSync(playerFile, JSON.stringify(data, null, 2));
};

module.exports = (bot) => {
    const START_IMG = "https://i.pinimg.com/736x/e1/97/3e/e1973e8421e69bc09f731b60f5102d97.jpg";
    const TANJIRO_IMG = "https://i.pinimg.com/736x/ab/26/81/ab26817caf5dbd8bd82f698f517649b7.jpg";
    const NEZUKO_IMG = "https://i.pinimg.com/736x/6c/02/c9/6c02c93d3991470183f6c169d1adc64e.jpg";

    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        let db = getDB();

        // Agar user pehle se registered hai
        if (db[userId] && db[userId].character) {
            return bot.sendMessage(chatId, `⚠️ You already selected: ${db[userId].character}`);
        }

        await bot.sendPhoto(chatId, START_IMG, {
            caption: "⚔️ Welcome! Choose your path:",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "👦 Tanjiro", callback_data: "tanjiro" }],
                    [{ text: "👧 Nezuko", callback_data: "nezuko" }]
                ]
            }
        });
    });

    bot.on("callback_query", async (query) => {
        const userId = query.from.id.toString();
        const data = query.data;
        if (data !== "tanjiro" && data !== "nezuko") return;

        let db = getDB();

        // Naya user entry
        if (!db[userId]) {
            db[userId] = { coins: 1000, gems: 0, mythicalCrystals: 5, character: null };
        }

        if (db[userId].character) {
            return bot.answerCallbackQuery(query.id, { text: "Already selected!", show_alert: true });
        }

        // Character set karo
        db[userId].character = data === "tanjiro" ? "Tanjiro" : "Nezuko";
        
        // SAVE KARO (Ye sabse important line hai)
        saveDB(db);

        bot.sendPhoto(query.message.chat.id, data === "tanjiro" ? TANJIRO_IMG : NEZUKO_IMG, {
            caption: `✅ Selected: ${db[userId].character}`
        });
        bot.answerCallbackQuery(query.id);
    });
};
