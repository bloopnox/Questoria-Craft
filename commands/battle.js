// commands/battle.js

const demons = require("../asset/demon");

const activeBattles = new Map();

module.exports = (bot) => {

    // =========================
    // ⚔️ START BATTLE
    // =========================

    bot.onText(/\/battle/, async (msg) => {

        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();

        if (activeBattles.has(userId)) {
            return bot.sendMessage(
                chatId,
                "⚔️ You are already in battle!"
            );
        }

        // Random Demon
        const demon =
            demons[Math.floor(Math.random() * demons.length)];

        // Random rewards
        const reward =
            Math.floor(
                Math.random() *
                (demon.reward[1] - demon.reward[0] + 1)
            ) + demon.reward[0];

        const exp =
            Math.floor(
                Math.random() *
                (demon.exp[1] - demon.exp[0] + 1)
            ) + demon.exp[0];

        // Player stats
        const session = {

            playerHp: 250,
            playerMaxHp: 250,
            playerAtk: 35,

            demon,

            reward,
            exp
        };

        activeBattles.set(userId, session);

        // Send battle image
        await bot.sendPhoto(
            chatId,
            demon.image,
            {
                caption:
                    `👹 *${demon.name} Appeared!*\n\n` +
                    `🏷 Rank: *${demon.rank}*\n` +
                    `⚔️ Type: *${demon.type}*\n\n` +

                    `❤️ Demon HP: *${demon.hp}*\n` +
                    `⚔️ Demon Attack: *${demon.attack}*\n\n` +

                    `🧍 Your HP: *${session.playerHp}*\n` +
                    `⚔️ Your Attack: *${session.playerAtk}*\n\n` +

                    `Choose your move.`,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "⚔️ Attack",
                                callback_data: `battle_attack_${userId}`
                            },
                            {
                                text: "🏃 Run",
                                callback_data: `battle_run_${userId}`
                            }
                        ]
                    ]
                }
            }
        );
    });

    // =========================
    // 🎮 BUTTON SYSTEM
    // =========================

    bot.on("callback_query", async (query) => {

        const data = query.data;

        if (
            !data.startsWith("battle_attack_") &&
            !data.startsWith("battle_run_")
        ) return;

        const chatId = query.message.chat.id;
        const userId = query.from.id.toString();

        const targetId = data.split("_")[2];

        // Anti steal
        if (targetId !== userId) {

            return bot.answerCallbackQuery(query.id, {
                text: "❌ This is not your battle!",
                show_alert: true
            });
        }

        const session = activeBattles.get(userId);

        if (!session) {

            return bot.answerCallbackQuery(query.id, {
                text: "⚠️ Battle expired!",
                show_alert: true
            });
        }

        const demon = session.demon;

        // =========================
        // 🏃 RUN
        // =========================

        if (data.startsWith("battle_run_")) {

            activeBattles.delete(userId);

            await bot.editMessageCaption(
                `🏃 You escaped from *${demon.name}*!`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: "Markdown"
                }
            );

            return bot.answerCallbackQuery(query.id);
        }

        // =========================
        // ⚔️ ATTACK
        // =========================

        let playerDamage =
            Math.floor(Math.random() * 20) +
            session.playerAtk;

        demon.hp -= playerDamage;

        let log =
            `⚔️ You dealt *${playerDamage}* damage!\n`;

        // Demon dead
        if (demon.hp <= 0) {

            activeBattles.delete(userId);

            // Economy save
            if (global.economyDB) {

                let db = global.economyDB.getDB();

                db[userId] =
                    global.economyDB.sanitizeUserObject(
                        db[userId]
                    );

                db[userId].coins += session.reward;
                db[userId].exp += session.exp;

                global.economyDB.saveDB(db);
            }

            await bot.editMessageCaption(
                `🏆 *Victory!*\n\n` +
                `You defeated *${demon.name}*\n\n` +

                `🪙 Coins Earned: *${session.reward}*\n` +
                `⭐ EXP Earned: *${session.exp}*`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: "Markdown"
                }
            );

            return bot.answerCallbackQuery(query.id);
        }

        // Demon attack
        let demonDamage =
            Math.floor(Math.random() * 10) +
            demon.attack;

        session.playerHp -= demonDamage;

        log +=
            `👹 ${demon.name} dealt *${demonDamage}* damage!\n`;

        // Player dead
        if (session.playerHp <= 0) {

            activeBattles.delete(userId);

            await bot.editMessageCaption(
                `💀 *You were defeated by ${demon.name}*`,
                {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: "Markdown"
                }
            );

            return bot.answerCallbackQuery(query.id);
        }

        // =========================
        // 🔄 UPDATE MESSAGE
        // =========================

        await bot.editMessageCaption(
            `👹 *${demon.name}*\n\n` +

            `${log}\n` +

            `❤️ Demon HP: *${demon.hp}*\n` +
            `🧍 Your HP: *${session.playerHp}*`,
            {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "⚔️ Attack",
                                callback_data: `battle_attack_${userId}`
                            },
                            {
                                text: "🏃 Run",
                                callback_data: `battle_run_${userId}`
                            }
                        ]
                    ]
                }
            }
        );

        return bot.answerCallbackQuery(query.id);
    });
};
