console.log("💰 ECONOMY ENGINE v2.6 [FULL SLAYER METRICS & SPIN DROPS INTEGRATED]");

const fs = require("fs");
const path = require("path");
const playerFile = path.join(process.cwd(), "data", "players.json");

// Dynamic items allocation pool for spinning rewards mapping
const { characters: normalCards } = require("../asset/assets.js");
const { mythical: mythicCards } = require("../asset/mythical.js");

const getDB = () => {
    try {
        if (!fs.existsSync(playerFile)) return {};
        return JSON.parse(fs.readFileSync(playerFile, "utf8"));
    } catch (e) { return {}; }
};

const saveDB = (data) => {
    try {
        const tempPath = playerFile + ".tmp";
        fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
        fs.renameSync(tempPath, playerFile);
    } catch (e) { console.error("🔥 Economy Write Error:", e); }
};

module.exports = (bot) => {

    const ensureUser = (userId) => {
        let db = getDB();
        if (!db[userId]) {
            db[userId] = { 
                coins: 500, crystals: 0, mythic: 0, exp: 0, level: 1, 
                last_daily: "", active_task: null,
                inventory: [],
                materials: [] // 🧪 Wisteria Serum & ⚔️ Nichirin Ore storage grid matrix
            };
            saveDB(db);
        } else {
            // Hot-patch layer for old accounts initialization parameters
            if (!db[userId].materials) db[userId].materials = [];
            if (!db[userId].inventory) db[userId].inventory = [];
        }
        return db;
    };

    const assignTask = (user) => {
        const pool = [
            { id: "hunt", desc: "Hunt 5 demons", target: 5 },
            { id: "battle", desc: "Play 10 battles", target: 10 },
            { id: "work", desc: "Work 5 times", target: 5 }
        ];
        const t = pool[Math.floor(Math.random() * pool.length)];
        user.active_task = { ...t, progress: 0, completed: false };
    };

    // ==========================================
    // 1. BALANCE & PROFILE
    // ==========================================
    bot.onText(/\/(?:balance|bal)/, (msg) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        let p = db[userId];
        const text = `💠 **VELIX OS | SLAYER CORPS PROFILE** 💠\n━━━━━━━━━━━━━━━━━━━━\n💰 **Coins:** \`${Number(p.coins).toLocaleString()}\`\n💎 **Crystals:** \`${Number(p.crystals).toLocaleString()}\`\n✨ **Mythic Tokens:** \`${Number(p.mythic).toLocaleString()}\`\n📊 **Slayer Level:** ${p.level} (XP: ${p.exp})\n📦 **Vault Materials:** \`${p.materials.length}\` items (\`/essence\` or \`/blessing\` to check)\n━━━━━━━━━━━━━━━━━━━━`;
        bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    });

    // ==========================================
    // 2. TASK SYSTEM
    // ==========================================
    bot.onText(/\/task/, (msg) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        let p = db[userId];
        const today = new Date().toISOString().split('T')[0];

        if (!p.active_task || p.last_daily !== today) {
            assignTask(p);
            p.last_daily = today;
            saveDB(db);
        }

        const t = p.active_task;
        const status = t.completed ? "✅ COMPLETED" : "⏳ PENDING";
        const text = `📋 **DAILY MISSION**\n\nTask: ${t.desc}\nStatus: ${status}\nProgress: [${t.progress}/${t.target}]\n\nReward: 20 Mythic + 50 XP`;
        bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
    });

    // ==========================================
    // 3. CONVERTER (FIXED & SECURED)
    // ==========================================
    bot.onText(/\/convert (.+) (.+)/, (msg, match) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        const type = match[1].toLowerCase();
        const amount = parseInt(match[2], 10);

        if (isNaN(amount) || amount <= 0) {
            return bot.sendMessage(msg.chat.id, "❌ **Error:** Please provide a valid positive number for conversion.");
        }

        if (type === "c2cr") { 
            const cost = amount * 100;
            if (db[userId].coins < cost) return bot.sendMessage(msg.chat.id, `❌ Not enough coins. Need 🪙 ${cost.toLocaleString()}`);
            db[userId].coins -= cost;
            db[userId].crystals += amount;
            bot.sendMessage(msg.chat.id, `🔄 **Conversion Success!**\nConverted \`${cost.toLocaleString()} Coins\` to \`${amount.toLocaleString()} Crystals\`!`);
        } else if (type === "cr2mt") { 
            const cost = amount * 100;
            if (db[userId].crystals < cost) return bot.sendMessage(msg.chat.id, `❌ Not enough crystals. Need 💎 ${cost.toLocaleString()}`);
            db[userId].crystals -= cost;
            db[userId].mythic += amount;
            bot.sendMessage(msg.chat.id, `🔄 **Conversion Success!**\nConverted \`${cost.toLocaleString()} Crystals\` to \`${amount.toLocaleString()} Mythic Tokens\`!`);
        } else {
            bot.sendMessage(msg.chat.id, "❌ **Invalid Type!** Use \`c2cr\` (Coins to Crystals) or \`cr2mt\` (Crystals to Tokens).");
        }
        saveDB(db);
    });

    // ==========================================
    // 4. SPIN (SLAYER LUCKY SLOTS DROP MECHANICS)
    // ==========================================
    bot.onText(/\/spin/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        let p = db[userId];

        const COIN_COST = 1200;
        const TOKEN_COST = 5;
        let paymentMethod = "";

        if (p.coins >= COIN_COST) {
            p.coins -= COIN_COST;
            paymentMethod = `🪙 -${COIN_COST} Coins`;
        } else if (p.mythic >= TOKEN_COST) {
            p.mythic -= TOKEN_COST;
            paymentMethod = `✨ -${TOKEN_COST} Tokens`;
        } else {
            return bot.sendMessage(chatId, `❌ **Insufficient Funds!**\n\nNeed 🪙 ${COIN_COST} Coins or ✨ ${TOKEN_COST} Mythic Tokens to spin!`, { parse_mode: "Markdown" });
        }

        saveDB(db);

        const rollingMsg = await bot.sendMessage(chatId, `🎰 **CORPS SLOTS ARCHITECTURE**\n━━━━━━━━━━━━━━━━━━━━\n🔄 [ 🟦 | 🟦 | 🟦 ] **Rerolling arrays...**\n━━━━━━━━━━━━━━━━━━━━\n🎟️ \`Fee:\` ${paymentMethod}`);

        const matrixFrames = [
            `🎰 **CORPS SLOTS ARCHITECTURE**\n━━━━━━━━━━━━━━━━━━━━\n🔄 [ 🧪 | ⚔️ | 🪙 ] *Sifting supply files...*\n━━━━━━━━━━━━━━━━━━━━\n🎟️ \`Fee:\` ${paymentMethod}`,
            `🎰 **CORPS SLOTS ARCHITECTURE**\n━━━━━━━━━━━━━━━━━━━━\n🔄 [ 💎 | 💎 | 🧪 ] *Calibrating drop matrix...*\n━━━━━━━━━━━━━━━━━━━━\n🎟️ \`Fee:\` ${paymentMethod}`,
            `🎰 **CORPS SLOTS ARCHITECTURE**\n━━━━━━━━━━━━━━━━━━━━\n🔄 [ ⚔️ | 👑 | 💎 ] *Assembling components...*\n━━━━━━━━━━━━━━━━━━━━\n🎟️ \`Fee:\` ${paymentMethod}`
        ];

        for (let i = 0; i < matrixFrames.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 750));
            await bot.editMessageText(matrixFrames[i], {
                chat_id: chatId,
                message_id: rollingMsg.message_id,
                parse_mode: "Markdown"
            }).catch(() => {});
        }

        const rollValue = Math.random() * 100;
        let slotDisplay = "";
        let rewardTitle = "";
        let rewardText = "";

        if (rollValue < 2) { 
            // 2% Mythic Jackpot: 25 Tokens
            const amt = 25;
            p.mythic = Number(p.mythic || 0) + amt;
            slotDisplay = "👑 | 👑 | 👑";
            rewardTitle = "✨ MYTHICAL JACKPOT EXTRACTION ✨";
            rewardText = `🎉 You won **${amt} Mythic Tokens**!`;
        } 
        else if (rollValue < 12) { 
            // 10% Crystal Matrix Drop: 12 Crystals
            const amt = 12;
            p.crystals = Number(p.crystals || 0) + amt;
            slotDisplay = "💎 | 💎 | 💎";
            rewardTitle = "💎 CRYSTAL MATRIX DROP 💎";
            rewardText = `🎁 You won **${amt} Crystals**!`;
        } 
        else if (rollValue < 40) { 
            // 28% Big Coins Return: 3,000 Coins
            const amt = 3000;
            p.coins += amt;
            slotDisplay = "🪙 | 🪙 | 🧪";
            rewardTitle = "🪙 MASSIVE COINS RETURN 🪙";
            rewardText = `💵 You won **${amt.toLocaleString()} Coins**!`;
        } 
        else if (rollValue < 75) { 
            // 35% DEMON SLAYER SPECIFIC REWARD MATRIX GENERATION
            const normalKeys = Object.keys(normalCards || {});
            const mythicKeys = Object.keys(mythicCards || {});
            const combinedKeys = [...new Set([...normalKeys, ...mythicKeys])];
            const randomChar = combinedKeys[Math.floor(Math.random() * combinedKeys.length)] || "tanjiro";

            if (Math.random() < 0.6) {
                // 60% of inventory drops -> Wisteria Serum (Level item)
                const rType = Math.random() < 0.25 ? "mythic" : "normal";
                const itemId = `${randomChar}_${rType}_essence`;
                p.materials.push(itemId);
                
                slotDisplay = "🧪 | 🧪 | 📦";
                rewardTitle = "🧪 VAULT DROPS: WISTERIA SERUM 🧪";
                rewardText = `📦 Crafted specific **${randomChar.toUpperCase()} [${rType.toUpperCase()}] Wisteria Serum**! Added directly to materials block stack register. Check with \`/essence ${randomChar}\`.`;
            } else {
                // 40% of inventory drops -> Nichirin Ore (Awakening item)
                const rType = Math.random() < 0.25 ? "mythic" : "normal";
                const itemId = `${randomChar}_${rType}_blessing`;
                p.materials.push(itemId);

                slotDisplay = "⚔️ | ⚔️ | 📦";
                rewardTitle = "⚔️ SMITHY DROPS: NICHIRIN ORE ⚔️";
                rewardText = `📦 Salvaged specific **${randomChar.toUpperCase()} [${rType.toUpperCase()}] Nichirin Ore**! Added to blacksmith storage block queue. Check with \`/blessing ${randomChar}\`.`;
            }
        }
        else { 
            slotDisplay = "💀 | ❌ | 🪵";
            rewardTitle = "💥 STRUCTURAL DEAD DROP 💥";
            rewardText = "Better luck next time! The breathing forms lapsed and arrays dropped empty values.";
        }

        saveDB(db);

        let finalLayout = `🎰 **CORPS SLOTS ARCHITECTURE**\n━━━━━━━━━━━━━━━━━━━━\n✨ [ ${slotDisplay} ] ✨\n━━━━━━━━━━━━━━━━━━━━\n\n` +
                          `⚡ **${rewardTitle}**\n\n${rewardText}\n\n` +
                          `📊 **Updated Vault Ledger:**\n` +
                          `• 🪙 Balance: \`${p.coins.toLocaleString()}\`\n` +
                          `• 💎 Crystals: \`${Number(p.crystals).toLocaleString()}\`\n` +
                          `• ✨ Tokens: \`${Number(p.mythic).toLocaleString()}\``;

        await bot.editMessageText(finalLayout, {
            chat_id: chatId,
            message_id: rollingMsg.message_id,
            parse_mode: "Markdown"
        }).catch(() => {});
    });

    // ==========================================
    // 5. WORK (WITH TASK INTEGRATION)
    // ==========================================
    bot.onText(/\/work/, (msg) => {
        const userId = msg.from.id.toString();
        let db = ensureUser(userId);
        let p = db[userId];
        
        const earnings = 200;
        p.coins += earnings;
        
        if (p.active_task && p.active_task.id === "work" && !p.active_task.completed) {
            p.active_task.progress += 1;
            if (p.active_task.progress >= p.active_task.target) {
                p.active_task.completed = true;
                p.mythic += 20; p.exp += 50;
                bot.sendMessage(msg.chat.id, "🎉 Task Completed! +20 Mythic Tokens & +50 XP!");
            }
        }
        
        saveDB(db);
        bot.sendMessage(msg.chat.id, `💼 Worked! Earned ${earnings} coins.`);
    });
};
