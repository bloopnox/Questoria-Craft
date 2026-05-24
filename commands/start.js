const fs = require("fs");
const path = require("path");
const playerFile = path.join(__dirname, "../data/players.json");

// Helper: Hamesha file se naya data uthayega
const getDB = () => {
    try {
        if (!fs.existsSync(playerFile)) {
            fs.mkdirSync(path.dirname(playerFile), { recursive: true });
            fs.writeFileSync(playerFile, JSON.stringify({}), 'utf8');
        }
        return JSON.parse(fs.readFileSync(playerFile, "utf8") || "{}");
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

        // Agar user pehle se registered hai aur character chuna hua hai
        if (db[userId] && db[userId].character) {
            return bot.sendMessage(chatId, `⚠️ You already selected: ${db[userId].character}`);
        }

        // 🔥 CRITICAL FIX: Appending Owner's Telegram ID to prevent random user hijacking
        await bot.sendPhoto(chatId, START_IMG, {
            caption: "⚔️ **WELCOME TO THE DEMON CORPS** ⚔️\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nSlayer, choose your base starting path matrix to initialize registration:",
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "👦 Tanjiro", callback_data: `start_char:tanjiro:${userId}` },
                        { text: "👧 Nezuko", callback_data: `start_char:nezuko:${userId}` }
                    ]
                ]
            },
            parse_mode: "Markdown"
        });
    });

    bot.on("callback_query", async (query) => {
        const callerId = query.from.id.toString();
        const dataPayload = query.data;

        // Ensure we only process start_char payloads inside this file block
        if (!dataPayload.startsWith("start_char:")) return;

        const chunks = dataPayload.split(":");
        const actionChar = chunks[1];       // tanjiro or nezuko
        const originalOwnerId = chunks[2];  // The user who actually ran /start

        // 🔒 ANTI-HIJACK ACCESS GUARD: Prevents random users from clicking someone else's startup menu
        if (originalOwnerId !== callerId) {
            return bot.answerCallbackQuery(query.id, {
                text: "🔒 Access Denied! Ye dashboard aapka nahi hai. Apna menu setup karne ke liye khud /start type karein.",
                show_alert: true
            });
        }

        let db = getDB();

        if (db[callerId] && db[callerId].character) {
            return bot.answerCallbackQuery(query.id, { text: "⚠️ Account setup already finalized!", show_alert: true });
        }

        // 🔥 AUTOMATED ECONOMY SYNC: Registering default layout keys to stop /battle and /spin from throwing 0-reset or access blocks
        const finalCharacterName = actionChar === "tanjiro" ? "Tanjiro" : "Nezuko";
        
        db[callerId] = {
            coins: 1000,
            crystals: 5,               // Fully mapped grid keys
            mythic: 0,                 // Synced with economy.js token keys
            character: finalCharacterName,
            inventory: [finalCharacterName], // Puts the base selection character straight into squad arrays
            materials: {},
            lastWork: 0,
            lastTask: 0,
            level: 1
        };
        
        // Save state parameters right into core players.json filesystem 
        saveDB(db);

        // Delete old selection frame seamlessly
        bot.deleteMessage(query.message.chat.id, query.message.message_id).catch(() => {});

        // Direct dispatch confirmation layout photo packet
        bot.sendPhoto(query.message.chat.id, actionChar === "tanjiro" ? TANJIRO_IMG : NEZUKO_IMG, {
            caption: `✅ **REGISTRATION SUCCESSFUL**\n` +
                     `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                     `• **Selected Starter:** \`${finalCharacterName}\`\n` +
                     `• **Starting Balance:** 🪙 \`1,000\` Coins | 💎 \`5\` Crystals\n\n` +
                     `⚔️ *Your profile state has been safely recorded into the Slayer Financial Registry. Run /balance or /spin now!*`,
            parse_mode: "Markdown"
        });

        bot.answerCallbackQuery(query.id);
    });
};
