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
    // ⚙️ FORCE JOIN CONFIGURATION KEYS
    const GC_LINK = "https://t.me/Aapka_Group_Link_Yahan_Daalo"; // 👈 Apne Group ka Link yahan daalo
    const GC_CHAT_ID = "-100xxxxxxxxxx"; // 👈 Apne Group ki numeric Chat ID yahan daalo

    const START_IMG = "https://i.pinimg.com/736x/e1/97/3e/e1973e8421e69bc09f731b60f5102d97.jpg";
    const TANJIRO_IMG = "https://i.pinimg.com/736x/ab/26/81/ab26817caf5dbd8bd82f698f517649b7.jpg";
    const NEZUKO_IMG = "https://i.pinimg.com/736x/6c/02/c9/6c02c93d3991470183f6c169d1adc64e.jpg";

    // Dynamic membership verifier abstraction layer
    async function checkMembership(userId) {
        try {
            const member = await bot.getChatMember(GC_CHAT_ID, userId);
            return ['member', 'administrator', 'creator'].includes(member.status);
        } catch (error) {
            console.error("❌ Force Join status check failure:", error.message);
            return false; // Returns false if bot is not admin in GC
        }
    }

    // Main /start core entry node
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        let db = getDB();

        // Group filters - Bypass force join checks inside public chat environments
        if (msg.chat.type !== 'private') {
            return bot.sendMessage(chatId, "⚔️ **VELIX OS is active in this sector!**");
        }

        // Check if user already finalized registration sequence
        if (db[userId] && db[userId].character) {
            return bot.sendMessage(chatId, `⚠️ You already selected: ${db[userId].character}`);
        }

        // Execute dynamic membership check before throwing selection dashboard
        const isMember = await checkMembership(userId);

        if (!isMember) {
            // User did not join the GC -> Deliver Lock Warning Packet
            return bot.sendMessage(chatId,
                `🚨 **VELIX OS | ENCRYPTION LOCK**\n` +
                `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                `Slayer, you must synchronize with our core command hub before initiating the OS terminal interface.\n\n` +
                `📢 **Join our official GC first to unlock the bot setup!**`,
                {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🌐 Join Official GC', url: GC_LINK }],
                            [{ text: '🟢 Joined ✅', callback_data: `start_join_verify:${userId}` }]
                        ]
                    }
                }
            );
        }

        // If verified member, show standard starting matrix
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
        const chatId = query.message.chat.id;
        const messageId = query.message.message_id;

        // 🟢 BRANCH A: VERIFY "JOINED" BUTTON
        if (dataPayload.startsWith("start_join_verify:")) {
            await bot.answerCallbackQuery(query.id).catch(() => {});
            const originalOwnerId = dataPayload.split(":")[1];

            if (originalOwnerId !== callerId) {
                return bot.answerCallbackQuery(query.id, {
                    text: "🔒 Access Denied! Apna lock verification terminal check karne ke liye khud /start run karein.",
                    show_alert: true
                });
            }

            const isMember = await checkMembership(callerId);

            if (isMember) {
                // Member verified -> Wipe encryption frame and transition directly into character picker
                bot.deleteMessage(chatId, messageId).catch(() => {});
                
                return bot.sendPhoto(chatId, START_IMG, {
                    caption: "✅ **ENCRYPTION UNLOCKED**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\nSlayer, choose your base starting path matrix to initialize registration:",
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "👦 Tanjiro", callback_data: `start_char:tanjiro:${callerId}` },
                                { text: "👧 Nezuko", callback_data: `start_char:nezuko:${callerId}` }
                            ]
                        ]
                    },
                    parse_mode: "Markdown"
                });
            } else {
                return bot.sendMessage(chatId, "❌ **Verification Failed:** You have not joined the group yet! Please click the join button above, enter the group, and tap again.");
            }
        }

        // ⚔️ BRANCH B: REGISTRATION CHARACTER SELECTION LOCKOUTS
        if (!dataPayload.startsWith("start_char:")) return;

        const chunks = dataPayload.split(":");
        const actionChar = chunks[1];       // tanjiro or nezuko
        const originalOwnerId = chunks[2];  // The user who actually ran /start

        // 🔒 ANTI-HIJACK ACCESS GUARD
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

        const finalCharacterName = actionChar === "tanjiro" ? "Tanjiro" : "Nezuko";
        
        db[callerId] = {
            coins: 1000,
            crystals: 5,               
            mythic: 0,                  
            character: finalCharacterName,
            inventory: [finalCharacterName], 
            materials: {},
            lastWork: 0,
            lastTask: 0,
            level: 1
        };
        
        saveDB(db);

        // Delete selection frame cleanly
        bot.deleteMessage(chatId, messageId).catch(() => {});

        // Deliver profile registration confirmation packet
        bot.sendPhoto(chatId, actionChar === "tanjiro" ? TANJIRO_IMG : NEZUKO_IMG, {
            caption: `✅ **REGISTRATION SUCCESSFUL**\n` +
                     `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                     `• **Selected Starter:** \`${finalCharacterName}\`\n` +
                     `• **Starting Balance:** 🪙 \`1,000\` Coins | 💎 \`5\` Crystals\n\n` +
                     `⚔️ *Your profile state has been safely recorded into the Slayer Financial Registry. Run /balance or /spin now!*`,
            parse_mode: "Markdown"
        });

        bot.answerCallbackQuery(query.id).catch(() => {});
    });
};
