// ==========================================
// ⚔️ AUTOMATED CORPS BATTLE SYSTEM
// ==========================================

const demons = require("../assets/demon");

// ==========================================
// 👹 DEMON POOL
// ==========================================

const demonPool = [
    {
        name: "Hand Demon",
        hp: 300,
        attack: 25,
        rewardCoins: 120,
        rewardTokens: 0,
        image: demons.handdemon
    },
    {
        name: "Rui (Lower Moon 5)",
        hp: 600,
        attack: 45,
        rewardCoins: 300,
        rewardTokens: 5,
        image: demons.rui
    },
    {
        name: "Akaza (Upper Moon 3)",
        hp: 1500,
        attack: 85,
        rewardCoins: 800,
        rewardTokens: 25,
        image: demons.akaza
    },
    {
        name: "Kokushibo (Upper Moon 1)",
        hp: 2500,
        attack: 120,
        rewardCoins: 1500,
        rewardTokens: 50,
        image: demons.kokushibo
    }
];

// ==========================================
// ⚔️ ACTIVE BATTLES
// ==========================================

const activeBattles = new Map();

module.exports = (bot) => {

    // ==========================================
    // ⚔️ START BATTLE
    // ==========================================

    bot.onText(/\/battle/, async (msg) => {

        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        if (!global.economyDB) {
            return bot.sendMessage(chatId, "❌ Economy DB not found.");
        }

        let db = global.economyDB.getDB();

        db[userId] = global.economyDB.sanitizeUserObject(db[userId]);

        if (activeBattles.has(userId)) {
            return bot.sendMessage(chatId, "⚔️ You are already in battle!");
        }

        // Random demon
        const demon = {
            ...demonPool[Math.floor(Math.random() * demonPool.length)]
        };

        // Player stats
        const playerHp = 500;
        const playerAtk = 40;

        const session = {
            playerHp,
            playerMaxHp: playerHp,
            playerAtk,

            demonName: demon.name,
            demonHp: demon.hp,
            demonMaxHp: demon.hp,
            demonAtk: demon.attack,

            rewardCoins: demon.rewardCoins,
            rewardTokens: demon.rewardTokens,

            image: demon.image
        };

        activeBattles.set(userId, session);

        const battleButtons = {
            inline_keyboard: [
                [
                    {
                        text: "⚔️ Attack",
                        callback_data: `slay_attack:${userId}`
                    },
                    {
                        text: "🛡️ Defend",
                        callback_data: `slay_defend:${userId}`
                    }
                ],
                [
                    {
                        text: "🏃 Flee",
                        callback_data: `slay_flee:${userId}`
                    }
                ]
            ]
        };

        await bot.sendPhoto(chatId, session.image, {
            caption:
                `👹 *DEMON ENCOUNTER*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `⚠️ A wild *${session.demonName}* appeared!\n\n` +
                `❤️ Your HP: \`${session.playerHp}/${session.playerMaxHp}\`\n` +
                `⚔️ Your ATK: \`${session.playerAtk}\`\n\n` +
                `🖤 Demon HP: \`${session.demonHp}/${session.demonMaxHp}\`\n` +
                `💢 Demon ATK: \`${session.demonAtk}\`\n\n` +
                `Choose your move.`,
            parse_mode: "Markdown",
            reply_markup: battleButtons
        });
    });

    // ==========================================
    // 🎮 BUTTON SYSTEM
    // ==========================================

    bot.on("callback_query", async (query) => {

        const chatId = query.message.chat.id;
        const callerId = query.from.id.toString();
        const data = query.data;

        if (
            !data.startsWith("slay_attack:") &&
            !data.startsWith("slay_defend:") &&
            !data.startsWith("slay_flee:")
        ) return;

        const targetId = data.split(":")[1];

        // Anti button steal
        if (targetId !== callerId) {
            return bot.answerCallbackQuery(query.id, {
                text: "❌ This is not your battle.",
                show_alert: true
            });
        }

        const session = activeBattles.get(callerId);

        if (!session) {
            return bot.answerCallbackQuery(query.id, {
                text: "⚠️ Battle expired.",
                show_alert: true
            });
        }

        let log = "";

        // ==========================================
        // ⚔️ ATTACK
        // ==========================================

        if (data.startsWith("slay_attack:")) {

            let playerDamage =
                Math.floor(Math.random() * 20) + session.playerAtk;

            session.demonHp -= playerDamage;

            log += `⚔️ You dealt *${playerDamage}* damage!\n`;

            // Demon dead
            if (session.demonHp <= 0) {

                activeBattles.delete(callerId);

                let db = global.economyDB.getDB();

                db[callerId] =
                    global.economyDB.sanitizeUserObject(db[callerId]);

                db[callerId].coins += session.rewardCoins;
                db[callerId].mythic += session.rewardTokens;

                global.economyDB.saveDB(db);

                await bot.editMessageCaption(
                    `🏆 *VICTORY!*\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `You defeated *${session.demonName}*!\n\n` +
                    `🪙 Coins Earned: *${session.rewardCoins}*\n` +
                    `✨ Mythic Tokens: *${session.rewardTokens}*`,
                    {
                        chat_id: chatId,
                        message_id: query.message.message_id,
                        parse_mode: "Markdown"
                    }
                );

                return bot.answerCallbackQuery(query.id);
            }

            // Demon attacks
            let demonDamage =
                Math.floor(Math.random() * 15) +
                (session.demonAtk - 10);

            demonDamage = Math.max(5, demonDamage);

            session.playerHp -= demonDamage;

            log += `👹 ${session.demonName} dealt *${demonDamage}* damage!\n`;
        }

        // ==========================================
        // 🛡️ DEFEND
        // ==========================================

        if (data.startsWith("slay_defend:")) {

            let heal = Math.floor(Math.random() * 15) + 10;

            session.playerHp = Math.min(
                session.playerMaxHp,
                session.playerHp + heal
            );

            let demonDamage = Math.floor(Math.random() * 10) + 5;

            session.playerHp -= demonDamage;

            log += `🛡️ You defended and healed *${heal} HP*\n`;
            log += `👹 Enemy dealt only *${demonDamage}* damage!\n`;
        }

        // ==========================================
        // 🏃 FLEE
        // ==========================================

        if (data.startsWith("slay_flee:")) {

            activeBattles.delete(callerId);

            await bot.deleteMessage(
                chatId,
                query.message.message_id
            ).catch(() => {});

            bot.sendMessage(
                chatId,
                `🏃 You escaped from *${session.demonName}*!`,
                {
                    parse_mode: "Markdown"
                }
            );

            return bot.answerCallbackQuery(query.id);
        }

        // ==========================================
        // 💀 PLAYER DEAD
        // ==========================================

        if (session.playerHp <= 0) {

            activeBattles.delete(callerId);

            await bot.editMessageCaption(
                `💀 *MISSION FAILED*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `You were defeated by *${session.demonName}*...`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: "Markdown"
                }
            );

            return bot.answerCallbackQuery(query.id);
        }

        // ==========================================
        // 🔄 UPDATE BATTLE
        // ==========================================

        const updatedButtons = {
            inline_keyboard: [
                [
                    {
                        text: "⚔️ Attack",
                        callback_data: `slay_attack:${callerId}`
                    },
                    {
                        text: "🛡️ Defend",
                        callback_data: `slay_defend:${callerId}`
                    }
                ],
                [
                    {
                        text: "🏃 Flee",
                        callback_data: `slay_flee:${callerId}`
                    }
                ]
            ]
        };

        await bot.editMessageCaption(
            `⚔️ *BATTLE IN PROGRESS*\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `${log}\n` +
            `❤️ Your HP: \`${session.playerHp}/${session.playerMaxHp}\`\n` +
            `🖤 ${session.demonName} HP: \`${session.demonHp}/${session.demonMaxHp}\`\n\n` +
            `Choose your next move.`,
            {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "Markdown",
                reply_markup: updatedButtons
            }
        );

        return bot.answerCallbackQuery(query.id);
    });
};
