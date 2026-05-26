/**
 * VELIX OS V2.5 | CENTRAL REPORTING & QUERY MANAGEMENT SYSTEM
 * Allows users to report bugs, and owner to review them via /viewqueries
 */

const fs = require("fs");
const path = require("path");

// Report database path
const reportDbPath = path.join(process.cwd(), "data", "queries.json");

// Helper: Read queries database safely
const getQueriesDB = () => {
  try {
    if (!fs.existsSync(reportDbPath)) {
      fs.mkdirSync(path.dirname(reportDbPath), { recursive: true });
      fs.writeFileSync(reportDbPath, JSON.stringify([]), 'utf8');
    }
    return JSON.parse(fs.readFileSync(reportDbPath, "utf8") || "[]");
  } catch (e) { return []; }
};

// Helper: Save queries database safely
const saveQueriesDB = (data) => {
  fs.writeFileSync(reportDbPath, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = (bot) => {
  // 👑 SECURITY LOCK: Restricted to Prime Core Architect
  const OWNER_ID = "2086993762"; 

  // Simple state machine to track if user is writing a report
  const userStates = {};

  // =================================================================
  // 📥 1. USER SIDE: /report COMMAND
  // =================================================================
  bot.onText(/\/report/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (msg.chat.type !== 'private') {
      return bot.sendMessage(chatId, "❌ **Access Denied:** Please use this command in my Private Message (PM) link.", { parse_mode: 'Markdown' });
    }

    return bot.sendMessage(chatId,
      `⚠️ **VELIX OS | BUG REPORT TERMINAL**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Slayer, agar aapko bot mein koi glitch, calculation fault ya error mil raha hai, toh aap humein bata sakte hain.\n\n` +
      `Below diye gaye button par tap karein apni query darj karne ke liye:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✍️ Share Query', callback_data: `trigger_report_input:${userId}` }]
          ]
        }
      }
    );
  });

  // Handle Callback Query for "Share Query" button
  bot.on('callback_query', async (query) => {
    const { data, message, from, id } = query;
    if (!data.startsWith("trigger_report_input:")) return;

    await bot.answerCallbackQuery(id).catch(() => {});
    const targetUserId = data.split(":")[1];

    if (targetUserId !== from.id.toString()) {
      return bot.answerCallbackQuery(id, { text: "🔒 This dashboard is not yours!", show_alert: true });
    }

    // Put user into "WAITING_FOR_REPORT" state
    userStates[from.id.toString()] = { step: 'WAITING_FOR_REPORT', originalMsgId: message.message_id };

    bot.editMessageText(
      `📝 **WRITE YOUR QUERY:**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Abhi apna message/problem detail mein type karke send karein.\n\n` +
      `*Tip: Problem kya hai aur kis command mein hai, saaf likhein.*`,
      {
        chat_id: message.chat.id,
        message_id: message.message_id,
        parse_mode: 'Markdown'
      }
    );
  });

  // Listen for user report input text
  bot.on('message', async (msg) => {
    const userId = msg.from.id.toString();
    const chatId = msg.chat.id;

    // Check if message is a text and user is actually in report writing state
    if (!msg.text || !userStates[userId] || userStates[userId].step !== 'WAITING_FOR_REPORT') return;
    if (msg.text.startsWith("/")) return; // Ignore if they accidentally typed another command

    const userQueryText = msg.text;
    const username = msg.from.username ? `@${msg.from.username}` : "No Username";

    // Save into queries.json
    let db = getQueriesDB();
    db.push({
      id: (db.length + 1),
      userId: userId,
      username: username,
      query: userQueryText,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
    });
    saveQueriesDB(db);

    // Clear state
    delete userStates[userId];

    bot.sendMessage(chatId, 
      `✅ **REPORT SUBMITTED SUCCESSFULLY**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Slayer, aapki query central ledger mein record ho chuki hai. Core Team isko jald hi review karegi.\n\n` +
      `*Thank you for making VELIX OS better!*`,
      { parse_mode: 'Markdown' }
    );

    // Notify Owner instantly in private message
    bot.sendMessage(OWNER_ID, 
      `🚨 **NEW BUG REPORT RECEIVED!**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 **User:** ${username} (\`${userId}\`)\n` +
      `📝 **Query:** \`${userQueryText}\`\n\n` +
      `Type /viewqueries to check all active sheets.`,
      { parse_mode: 'Markdown' }
    ).catch(() => {}); // Safely catch if owner hasn't started the bot or blocked it
  });

  // =================================================================
  // 👑 OWNER SIDE: /viewqueries COMMAND
  // =================================================================
  bot.onText(/\/viewqueries/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    if (userId !== OWNER_ID) {
      return bot.sendMessage(chatId, "🔒 **Access Denied:** Only the Core Architect can view active tickets.");
    }

    let db = getQueriesDB();

    if (db.length === 0) {
      return bot.sendMessage(chatId, "📬 **QUERY LEDGER CLEAN:**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nZero pending bug reports or user queries found in database.", { parse_mode: 'Markdown' });
    }

    let reportSheet = `📂 **VELIX ACTIVE USER QUERIES (${db.length})**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Displaying last 10 queries to avoid hit text limits (or you can show all if low)
    const recentQueries = db.slice(-10); 

    recentQueries.forEach(item => {
      reportSheet += 
        `🔖 **Ticket ID:** \`#${item.id}\`\n` +
        `👤 **Slayer:** ${item.username} (\`${item.userId}\`)\n` +
        `🕒 **Time:** \`${item.timestamp}\`\n` +
        `📝 **Issue:** _${item.query}_\n` +
        `━━━━━━━━━━━━━━━━━━━━━\n`;
    });

    // Option to clear database
    return bot.sendMessage(chatId, reportSheet, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🗑️ Clear All Queries', callback_data: 'clear_all_queries_db' }]
        ]
      }
    });
  });

  // Callback to clear reports db
  bot.on('callback_query', async (query) => {
    const { data, from, message, id } = query;
    if (data !== 'clear_all_queries_db') return;

    await bot.answerCallbackQuery(id).catch(() => {});

    if (from.id.toString() !== OWNER_ID) {
      return bot.answerCallbackQuery(id, { text: "🔒 Command Restricted!", show_alert: true });
    }

    saveQueriesDB([]); // Empty the database array
    bot.editMessageText("🗑️ **QUERY LEDGER WIPED:**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAll user support tickets have been successfully archived and deleted.", {
      chat_id: message.chat.id,
      message_id: message.message_id,
      parse_mode: 'Markdown'
    });
  });
};
