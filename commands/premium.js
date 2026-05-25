/**
 * VELIX OS V2.6 | AUTOMATED PREMIUM PAYMENT GATEWAY
 * QR Based Payment + Manual Approve System
 * Fully Synced with godchar.js Registry
 */

const fs = require('fs');
const path = require('path');
const godTierRegistry = require("../asset/godchar");
const godCharManifest = godTierRegistry.godTierManifest || {};

console.log("💎 [LOADED SUCCESS] Premium Gateway Synced: premium.js");

module.exports = (bot) => {

  const ADMIN_ID = '2086993762';

  // ==========================================
  // 💳 PREMIUM PRICE DATABASE
  // ==========================================
  const premiumPriceChart = {

    yoriichi_godtier: {
      name: "Yoriichi Tsugikuni (Card)",
      price: "₹499",
      type: "card"
    },

    muzan_godtier: {
      name: "Muzan Kibutsuji (Card)",
      price: "₹399",
      type: "card"
    },

    kokushibo_godtier: {
      name: "Kokushibo (Card)",
      price: "₹199",
      type: "card"
    },

    yoriichi_essence_pack: {
      name: "Yoriichi God-Char Essence x50 + Blessing x5",
      price: "₹249",
      type: "material",
      target: "yoriichi_godtier"
    },

    muzan_essence_pack: {
      name: "Muzan God-Char Essence x50 + Blessing x5",
      price: "₹199",
      type: "material",
      target: "muzan_godtier"
    },

    kokushibo_essence_pack: {
      name: "Kokushibo God-Char Essence x50 + Blessing x5",
      price: "₹149",
      type: "material",
      target: "kokushibo_godtier"
    },

    universal_awakening_stone: {
      name: "Universal Awakening Catalyst Stone x1",
      price: "₹99",
      type: "universal"
    }

  };

  const LOCAL_QR_PATH = path.join(process.cwd(), 'asset', 'qr.jpg');

  // ==========================================
  // 👑 PREMIUM COMMAND
  // ==========================================
  bot.onText(/\/premium/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    bot.getPlayerData(userId);

    const opts = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✨ Essence & Blessings',
              callback_data: 'prem_shop_essence'
            },
            {
              text: '👑 God-Char Cards',
              callback_data: 'prem_view_godtier'
            }
          ]
        ]
      }
    };

    await bot.sendMessage(
      chatId,
      `👑 *VELIX OS | GOD SLAYER PREMIUM NETWORK*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Welcome to the premium terminal.\n\n` +
      `Choose a category below to continue.`,
      {
        parse_mode: 'Markdown',
        ...opts
      }
    );

  });

  // ==========================================
  // 🎮 CALLBACK HANDLER
  // ==========================================
  bot.on('callback_query', async (query) => {

    const chatId = query.message.chat.id;
    const clickerId = query.from.id.toString();
    const data = query.data;
    const messageId = query.message.message_id;

    if (!data.startsWith('prem_')) return;

    try {

      // ==========================================
      // 👑 VIEW GOD CARDS
      // ==========================================
      if (data === 'prem_view_godtier') {

        await bot.answerCallbackQuery(query.id).catch(() => {});

        let godTierMenu =
          `👑 *VELIX OS | GOD-TIER CARD VAULT*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        Object.keys(godCharManifest).forEach(key => {

          const char = godCharManifest[key];

          if (!char) return;

          if (
            char.id === "godTierArray" ||
            char.id === "godTierManifest"
          ) return;

          const price =
            premiumPriceChart[key]
              ? premiumPriceChart[key].price
              : "₹499";

          godTierMenu +=
            `⚡ *${char.name}*\n` +
            `🔹 Power: \`${char.power || char.atk || 4000}\`\n` +
            `💳 Price: \`${price}\`\n\n`;

        });

        godTierMenu +=
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Select a card below to purchase.`;

        return bot.sendMessage(
          chatId,
          godTierMenu,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '⚔️ Buy Yoriichi',
                    callback_data: 'prem_buy_yoriichi_godtier'
                  },
                  {
                    text: '👹 Buy Muzan',
                    callback_data: 'prem_buy_muzan_godtier'
                  }
                ],
                [
                  {
                    text: '🌙 Buy Kokushibo',
                    callback_data: 'prem_buy_kokushibo_godtier'
                  }
                ]
              ]
            }
          }
        );

      }

      // ==========================================
      // ✨ VIEW ESSENCE SHOP
      // ==========================================
      if (data === 'prem_shop_essence') {

        await bot.answerCallbackQuery(query.id).catch(() => {});

        const materialMenu =
          `✨ *VELIX OS | MATERIAL SHOP*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +

          `🧬 Yoriichi Pack ➜ \`₹249\`\n\n` +
          `🧪 Muzan Pack ➜ \`₹199\`\n\n` +
          `🌙 Kokushibo Pack ➜ \`₹149\`\n\n` +
          `💎 Awakening Stone ➜ \`₹99\`\n`;

        return bot.sendMessage(
          chatId,
          materialMenu,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🧬 Yoriichi Pack',
                    callback_data: 'prem_buy_yoriichi_essence_pack'
                  },
                  {
                    text: '🧪 Muzan Pack',
                    callback_data: 'prem_buy_muzan_essence_pack'
                  }
                ],
                [
                  {
                    text: '🌙 Kokushibo Pack',
                    callback_data: 'prem_buy_kokushibo_essence_pack'
                  },
                  {
                    text: '💎 Awakening Stone',
                    callback_data: 'prem_buy_universal_awakening_stone'
                  }
                ]
              ]
            }
          }
        );

      }

      // ==========================================
      // 💳 QR PAYMENT GENERATOR
      // ==========================================
      if (data.startsWith('prem_buy_')) {

        await bot.answerCallbackQuery(query.id).catch(() => {});

        const selectedAssetKey =
          data.replace('prem_buy_', '');

        const itemObj =
          premiumPriceChart[selectedAssetKey];

        if (!itemObj) return;

        await bot.sendMessage(
          chatId,
          `🔥 *Selection Locked*\n\n` +
          `📦 Item: *${itemObj.name}*\n` +
          `💳 Amount: *${itemObj.price}*\n\n` +
          `Generating secure payment QR...`,
          {
            parse_mode: 'Markdown'
          }
        );

        if (!fs.existsSync(LOCAL_QR_PATH)) {

          console.error(
            `❌ Missing QR File: ${LOCAL_QR_PATH}`
          );

          return bot.sendMessage(
            chatId,
            `❌ QR image missing from asset folder.`
          );

        }

        await bot.sendPhoto(
          chatId,
          fs.createReadStream(LOCAL_QR_PATH),
          {
            caption:
              `📸 *VELIX PAYMENT GATEWAY*\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +

              `📦 Item: *${itemObj.name}*\n` +
              `💳 Amount: *${itemObj.price}*\n\n` +

              `1. Scan the QR code above.\n` +
              `2. Complete the payment.\n` +
              `3. Wait for the payment confirmation button.\n\n` +

              `⚠️ Your order will remain pending until approved by the owner.`,
            parse_mode: 'Markdown'
          },
          {
            filename: 'qr.jpg',
            contentType: 'image/jpeg'
          }
        );

        // ==========================================
        // ⏳ WAITING MESSAGE AFTER 2 MINUTES
        // ==========================================
        setTimeout(async () => {

          try {

            await bot.sendMessage(
              chatId,
              `⏳ *PAYMENT STATUS PENDING*\n` +
              `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +

              `If you have completed the payment,\n` +
              `click the button below to notify the administration team.\n\n` +

              `The owner will manually verify and approve your purchase.`,
              {
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '✅ I Have Paid',
                        callback_data: `prem_paid_${selectedAssetKey}`
                      }
                    ]
                  ]
                }
              }
            );

          } catch (e) {
            console.log(e.message);
          }

        }, 120000);

      }

      // ==========================================
      // 🚨 USER PAYMENT NOTIFICATION
      // ==========================================
      if (data.startsWith('prem_paid_')) {

        await bot.answerCallbackQuery(query.id).catch(() => {});

        const assetKey =
          data.replace('prem_paid_', '');

        const itemObj =
          premiumPriceChart[assetKey];

        if (!itemObj) return;

        const username =
          query.from.username
            ? `@${query.from.username}`
            : query.from.first_name;

        await bot.sendMessage(
          ADMIN_ID,
          `🚨 *NEW PAYMENT REQUEST*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +

          `👤 User: ${username}\n` +
          `🆔 User ID: \`${clickerId}\`\n\n` +

          `📦 Item: *${itemObj.name}*\n` +
          `💳 Amount: *${itemObj.price}*\n\n` +

          `Approve or decline this transaction below.`,
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✅ Approve',
                    callback_data:
                      `prem_approve_${clickerId}_${assetKey}`
                  },
                  {
                    text: '❌ Decline',
                    callback_data:
                      `prem_reject_${clickerId}`
                  }
                ]
              ]
            }
          }
        );

        return bot.sendMessage(
          chatId,
          `✅ *Payment Notification Sent*\n\n` +
          `Your request has been sent to the owner.\n` +
          `Please wait for approval.`,
          {
            parse_mode: 'Markdown'
          }
        );

      }

      // ==========================================
      // ✅ APPROVE PAYMENT
      // ==========================================
      if (data.startsWith('prem_approve_')) {

        await bot.answerCallbackQuery(query.id).catch(() => {});

        if (clickerId !== ADMIN_ID) return;

        const chunks = data.split('_');

        const targetUserId = chunks[2];
        const assetIdKey = chunks.slice(3).join('_');

        const itemObj =
          premiumPriceChart[assetIdKey];

        if (!itemObj) {

          return bot.sendMessage(
            chatId,
            `❌ Invalid item key.`
          );

        }

        const targetProfile =
          bot.getPlayerData(targetUserId);

        if (!targetProfile) {

          return bot.sendMessage(
            chatId,
            `❌ Target player not found.`
          );

        }

        if (!targetProfile.inventory)
          targetProfile.inventory = [];

        if (!targetProfile.materials)
          targetProfile.materials = {};

        // ==========================================
        // 👑 CARD DELIVERY
        // ==========================================
        if (itemObj.type === "card") {

          const assetObj =
            godCharManifest[assetIdKey] || {
              id: assetIdKey,
              name: itemObj.name
            };

          targetProfile.inventory.push({

            id: assetObj.id || assetIdKey,
            name: assetObj.name,
            rarity: "God-Tier",

            level: 1,
            exp: 0,
            max_xp: 1000,

            power:
              assetObj.power ||
              assetObj.atk ||
              4500,

            atk:
              assetObj.atk ||
              4500,

            image:
              assetObj.image ||
              assetObj.img ||
              "",

            type: "God",

            isAwakened: false,
            awakeningStage: 0

          });

        }

        // ==========================================
        // ✨ MATERIAL DELIVERY
        // ==========================================
        else if (itemObj.type === "material") {

          const baseKey = itemObj.target;

          const essenceKey =
            `${baseKey}_god_char_essence`;

          const blessingKey =
            `${baseKey}_god_char_blessing`;

          targetProfile.materials[essenceKey] =
            (parseInt(
              targetProfile.materials[essenceKey],
              10
            ) || 0) + 50;

          targetProfile.materials[blessingKey] =
            (parseInt(
              targetProfile.materials[blessingKey],
              10
            ) || 0) + 5;

        }

        // ==========================================
        // 💎 UNIVERSAL STONE DELIVERY
        // ==========================================
        else if (itemObj.type === "universal") {

          targetProfile.materials[
            "universal_awakening_stone"
          ] =
            (parseInt(
              targetProfile.materials[
                "universal_awakening_stone"
              ],
              10
            ) || 0) + 1;

        }

        bot.savePlayerData(
          targetUserId,
          targetProfile
        );

        // ==========================================
        // 🎉 USER SUCCESS MESSAGE
        // ==========================================
        await bot.sendMessage(
          targetUserId,
          `🎉 *PAYMENT APPROVED*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +

          `Your payment for *${itemObj.name}* has been approved.\n\n` +

          `The rewards were successfully added to your account.`,
          {
            parse_mode: 'Markdown'
          }
        ).catch(() => {});

        // ==========================================
        // ✅ OWNER PANEL UPDATE
        // ==========================================
        return bot.editMessageText(
          `✅ *PAYMENT APPROVED*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +

          `👤 User ID: \`${targetUserId}\`\n` +
          `📦 Delivered: *${itemObj.name}*`,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown'
          }
        ).catch(() => {});

      }

      // ==========================================
      // ❌ REJECT PAYMENT
      // ==========================================
      if (data.startsWith('prem_reject_')) {

        await bot.answerCallbackQuery(query.id).catch(() => {});

        if (clickerId !== ADMIN_ID) return;

        const targetUserId =
          data.split('_')[2];

        await bot.sendMessage(
          targetUserId,
          `❌ *PAYMENT DECLINED*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +

          `Your payment request was declined by the owner.\n\n` +

          `Please contact support if you believe this was a mistake.`,
          {
            parse_mode: 'Markdown'
          }
        ).catch(() => {});

        return bot.editMessageText(
          `❌ *PAYMENT DECLINED*\n\n` +
          `👤 User ID: \`${targetUserId}\``,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown'
          }
        ).catch(() => {});

      }

    } catch (error) {

      console.error(
        "❌ Premium System Error:",
        error
      );

    }

  });

};
