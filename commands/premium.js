/**
 * VELIX OS V2.5 | SECURE PREMIUM GATEWAY
 * Simplified Manual Validation System
 */

const godTierRegistry = require("../asset/godchar");
const godCharManifest = godTierRegistry.godTierManifest || {};

module.exports = (bot) => {
  const ADMIN_ID = '2086993762'; 

  const premiumPriceChart = {
    yoriichi_godtier: { name: "Yoriichi Tsugikuni (Card)", price: "₹499", type: "card" },
    muzan_godtier: { name: "Muzan Kibutsuji (Card)", price: "₹399", type: "card" },
    kokushibo_godtier: { name: "Kokushibo (Card)", price: "₹199", type: "card" },
    yoriichi_essence_pack: { name: "Yoriichi God-Char Essence x50 + Blessing x5", price: "₹249", type: "material", target: "yoriichi_godtier" },
    muzan_essence_pack: { name: "Muzan God-Char Essence x50 + Blessing x5", price: "₹199", type: "material", target: "muzan_godtier" },
    kokushibo_essence_pack: { name: "Kokushibo God-Char Essence x50 + Blessing x5", price: "₹149", type: "material", target: "kokushibo_godtier" },
    universal_awakening_stone: { name: "Universal Awakening Catalyst Stone x1", price: "₹99", type: "universal" }
  };

  bot.onText(/\/premium/, (msg) => {
    const opts = {
      reply_markup: {
        inline_keyboard: [[
          { text: '✨ Essence & Blessings', callback_data: 'prem_shop_essence' },
          { text: '👑 God-Char Cards', callback_data: 'prem_view_godtier' }
        ]]
      }
    };
    bot.sendMessage(msg.chat.id, `👑 **VELIX OS | PREMIUM HUB**\nSelect a branch to proceed:`, { parse_mode: 'Markdown', ...opts });
  });

  bot.on('callback_query', async (query) => {
    const data = query.data;
    if (!data || !data.startsWith('prem_')) return;
    
    const chatId = query.message.chat.id;
    const buyerId = query.from.id.toString();

    // 1. View Menus
    if (data === 'prem_view_godtier' || data === 'prem_shop_essence') {
      await bot.answerCallbackQuery(query.id);
      // ... (Menu logic remains same as before) ...
    }

    // 2. Buy Trigger -> "Mark as Paid" Button
    if (data.startsWith('prem_buy_')) {
      await bot.answerCallbackQuery(query.id);
      const key = data.replace('prem_buy_', '');
      const item = premiumPriceChart[key];
      
      await bot.sendMessage(chatId, `🔥 **Payment Pending**\nItem: ${item.name}\nPrice: ${item.price}\n\nPlease complete payment and click below:`, {
        reply_markup: {
          inline_keyboard: [[ { text: '🟢 Mark as Paid', callback_data: `prem_confirm_${buyerId}_${key}` } ]]
        }
      });
    }

    // 3. User Notifies Admin
    if (data.startsWith('prem_confirm_')) {
      const [_, buyer, key] = data.split('_');
      const item = premiumPriceChart[key];
      
      await bot.sendMessage(ADMIN_ID, `🚨 **New Payment Claim**\nUser: ${query.from.username || 'User'}\nItem: ${item.name}\n\nAction:`, {
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Approve', callback_data: `prem_approve_${buyer}_${key}` },
            { text: '❌ Decline', callback_data: `prem_reject_${buyer}` }
          ]]
        }
      });
      await bot.answerCallbackQuery(query.id, { text: "Notification sent to Admin!" });
    }

    // 4. Admin Approves/Rejects
    if (data.startsWith('prem_approve_') || data.startsWith('prem_reject_')) {
      if (query.from.id.toString() !== ADMIN_ID) return;
      
      const [action, targetUserId, assetKey] = [data.split('_')[0], data.split('_')[2], data.split('_')[3]];
      
      if (action === 'approve') {
        const profile = bot.getPlayerData(targetUserId);
        // ... (Injection logic remains same) ...
        bot.savePlayerData(targetUserId, profile);
        bot.sendMessage(targetUserId, "✅ Your payment verified! Assets added.");
        bot.editMessageText("✅ Approved.", { chat_id: chatId, message_id: query.message.message_id });
      } else {
        bot.sendMessage(targetUserId, "❌ Your payment claim was declined.");
        bot.editMessageText("❌ Declined.", { chat_id: chatId, message_id: query.message.message_id });
      }
    }
  });
};
