/**
 * VELIX OS V2.5 | CENTRAL MYTHICAL FACTION EXCHANGE SHOP
 * Fully Synchronized with Centralized Ledger & Card Inventories
 * Thread-Safe State Handler with Isolated Callback Query Triggers
 */

const mythical = require("../asset/mythical");

console.log("🏪 [LOADED SUCCESS] Mythical Card Exchange Matrix Linked: mythicalshop.js");

module.exports = (bot) => {

  // ==========================================
  // 🏪 /mythicalshop - ALLIANCE CARD VISUALIZER
  // ==========================================
  bot.onText(/^\/mythicalshop$/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // Pulling profile layers from the unified ledger hook
    const player = bot.getPlayerData ? bot.getPlayerData(userId) : null;
    if (!player) return;

    // Syncing with existing schema naming patterns
    const crystals = player.mythicalCrystals || 0;

    let shopLayoutText = `💎 **VELIX OS | MYTHICAL ALLIANCE SHOP** 💎\n` +
                         `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                         `💠 **Your Core Reserves:** \`${crystals}\` Mythic Crystals\n\n` +
                         ` available mythical elite ranks to add to your division:\n\n`;

    mythical.forEach((card, index) => {
      shopLayoutText += `⚡ **${index + 1}. ${card.name}**\n` +
                        `   └ 🔱 CP Output: \`${(card.power || 0).toLocaleString()}\`\n` +
                        `   └ 💠 Price Target: \`${card.cost}\` Crystals\n` +
                        `   └ 🆔 Identifier: \`${card.id}\`\n\n`;
    });

    shopLayoutText += `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                      `💡 *Click the grid interaction keys below to view core statistics.*`;

    // Dispatching visual workspace interface matrix
    bot.sendMessage(chatId, shopLayoutText, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: mythical.map((card) => [
          {
            text: `👁‍🗨 View Framework: ${card.name}`,
            callback_data: `view_${card.id}_${userId}` // Attached userId to enforce action perimeter lock
          }
        ])
      }
    }).catch(e => console.error("Error sending mythical shop grid:", e.message));
  });

  // ==========================================
  // 🔘 INTERACTIVE MATRIX CELL PROCESSING (VIEW ACTION)
  // ==========================================
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
    const clickerId = query.from.id.toString();

    if (data.startsWith("view_")) {
      const parts = data.split("_");
      const cardId = parts[1];
      const authorizedUserId = parts[2];

      // Security check: Action lock out for foreign grid components
      if (clickerId !== authorizedUserId) {
        return bot.answerCallbackQuery(query.id, {
          text: "❌ Operational Violation: This transaction terminal interface isn't routed to your grid network.",
          show_alert: true
        });
      }

      const card = mythical.find((c) => c.id === cardId);
      if (!card) {
        return bot.answerCallbackQuery(query.id, { text: "❌ Frame Data could not be mapped inside internal schemas." });
      }

      bot.answerCallbackQuery(query.id);

      const frameCaps = `🎴 **VELIX OS CARD BLUEPRINT**\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `📛 **Designation:** \`${card.name}\`\n` +
                        `⚔️ **Inherent Power:** \`${(card.power || 0).toLocaleString()} CP\`\n` +
                        `💠 **Acquisition Cost:** \`${card.cost}\` Mythic Crystals\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `💡 *To buy this character entity, use standard forge execution.*`;

      // Dispatching technical layout photo card
      if (card.image) {
        bot.sendPhoto(chatId, card.image, {
          caption: frameCaps,
          parse_mode: "Markdown"
        }).catch(err => console.error("Error sending card rendering:", err.message));
      } else {
        bot.sendMessage(chatId, frameCaps, { parse_mode: "Markdown" });
      }
    }
  });

};
