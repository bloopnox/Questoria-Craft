console.log("✅ INDEPENDENT CHARACTER ECOSYSTEM LOADED WITH MASTER COMMANDS");

const fs = require("fs");
const path = require("path");

// ==========================================
// PATHS & LOADING YOUR DATA FILES
// ==========================================
const dataDir = path.join(__dirname, "../data");
const playerFile = path.join(dataDir, "players.json");

const assetsPath = path.join(__dirname, "../assets.js");
const mythicalPath = path.join(__dirname, "../mythical.js");

let normalCards = {};
let mythicCards = {};

// Helper function to dynamically pull records cleanly
const loadCharacterFiles = () => {
  try {
    delete require.cache[require.resolve(assetsPath)];
    normalCards = require(assetsPath);
  } catch (e) {
    normalCards = {};
    console.log("⚠️ assets.js not found or configured improperly!");
  }

  try {
    delete require.cache[require.resolve(mythicalPath)];
    mythicCards = require(mythicalPath);
  } catch (e) {
    mythicCards = {};
    console.log("⚠️ mythical.js not found or configured improperly!");
  }
};

loadCharacterFiles();

// Establish storage architecture
try {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(playerFile)) fs.writeFileSync(playerFile, JSON.stringify({}), "utf8");
} catch (err) {
  console.error("❌ Error initializing system storage logs:", err.message);
}

let players = {};
try { players = JSON.parse(fs.readFileSync(playerFile, "utf8")); } catch { players = {}; }

const savePlayers = () => fs.writeFileSync(playerFile, JSON.stringify(players, null, 2));

module.exports = (bot) => {

  const getPlayer = (userId) => {
    if (!players[userId]) {
      players[userId] = { coins: 1000, tokens: 0, level: 1, xp: 0, characters: [] };
      savePlayers();
    }
    if (!players[userId].characters) {
      players[userId].characters = [];
      savePlayers();
    }
    return players[userId];
  };

  // Temp tracking memory object to hold active trades pending authorization
  const activeTrades = {};

  // ==========================================
  // 🔍 1. SEARCH CHARACTER COMMAND (/char tanjiro)
  // ==========================================
  bot.onText(/\/char (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const searchInput = match[1].trim().toLowerCase().replace(/\s+/g, "_");

    const hasNormal = normalCards[searchInput] ? true : false;
    const hasMythic = mythicCards[searchInput] ? true : false;

    if (!hasNormal && !hasMythic) {
      return bot.sendMessage(chatId, `❌ **Character "${match[1]}" was not found in database registry!**`, { parse_mode: "Markdown" });
    }

    const buttons = [];
    const charName = (hasNormal ? normalCards[searchInput].name : mythicCards[searchInput].name) || match[1];

    if (hasNormal) buttons.push({ text: "🟢 Normal Version", callback_data: `vchar_${searchInput}_normal` });
    if (hasMythic) buttons.push({ text: "🔥 Mythic Version", callback_data: `vchar_${searchInput}_mythic` });

    bot.sendMessage(chatId, `🔍 **Character Found: ${charName}**\n\nChoose character variation profile to review ownership status:`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [buttons]
      }
    });
  });

  // ==========================================
  // 🛠️ 2. CORE AUTOMATED ADDCHAR COMMAND 
  // Format: /addchar Name | Rarity | HP | ATK | Description | ImageURL
  // ==========================================
  bot.onText(/\/addchar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const ADMIN_ID = "YOUR_TELEGRAM_USER_ID"; // <-- Input your exact master ID string
    if (userId !== ADMIN_ID) return;

    const input = match[1].split("|").map(item => item.trim());
    if (input.length < 6) {
      return bot.sendMessage(chatId, "❌ **Invalid Formatting Structure!**\nUse: `/addchar Name | Rarity | HP | ATK | Description | ImageURL`", { parse_mode: "Markdown" });
    }

    const [name, rarity, hp, atk, desc, img] = input;
    const targetRarity = rarity.toLowerCase();
    const key = name.toLowerCase().replace(/\s+/g, "_");

    if (targetRarity !== "normal" && targetRarity !== "mythic") {
      return bot.sendMessage(chatId, "❌ **Error:** Type profile definition must match either `Normal` or `Mythic` exactly.");
    }

    const targetFile = targetRarity === "mythic" ? mythicalPath : assetsPath;
    let targetDataset = targetRarity === "mythic" ? mythicCards : normalCards;

    targetDataset[key] = {
      name: name,
      hp: parseInt(hp) || 100,
      atk: parseInt(atk) || 10,
      desc: desc,
      img: img
    };

    try {
      fs.writeFileSync(targetFile, `module.exports = ${JSON.stringify(targetDataset, null, 2)};`, "utf8");
      loadCharacterFiles(); // clear execution runtime pointer maps

      bot.sendMessage(chatId, `✅ **Success!** Automatically wrote data for **${name}** directly inside production configuration arrays!`, { parse_mode: "Markdown" });
    } catch (err) {
      bot.sendMessage(chatId, `❌ **System Execution Failure:** Couldn't save file payload: ${err.message}`);
    }
  });

  // ==========================================
  // 👑 3. ADMIN GIVE CARD UTILITY (Any User / Self)
  // Format: /givechar UserID | CharacterID | Rarity
  // Example: /givechar 987654321 | tanjiro | mythic
  // ==========================================
  bot.onText(/\/givechar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const ADMIN_ID = "YOUR_TELEGRAM_USER_ID"; // <-- Input your exact master ID string
    if (userId !== ADMIN_ID) return;

    const input = match[1].split("|").map(item => item.trim());
    if (input.length < 3) {
      return bot.sendMessage(chatId, "❌ **Format:** \`/givechar UserID | CardID | Rarity\`", { parse_mode: "Markdown" });
    }

    const [targetUser, cardId, rarity] = input;
    const cleanRarity = rarity.toLowerCase();
    const targetDataset = cleanRarity === "mythic" ? mythicCards : normalCards;

    if (!targetDataset[cardId]) {
      return bot.sendMessage(chatId, `❌ **Validation Error:** Character identity structure \`${cardId}\` not registered within designated inventory files!`, { parse_mode: "Markdown" });
    }

    const targetPlayer = getPlayer(targetUser);
    
    // Prevent duplicate entries of the same unique variation card
    const hasCard = targetPlayer.characters.some(c => c.id === cardId && c.rarity === cleanRarity);
    if (hasCard) {
      return bot.sendMessage(chatId, `⚠️ Target recipient user already houses this variation index card configuration.`);
    }

    targetPlayer.characters.push({
      id: cardId,
      rarity: cleanRarity,
      name: targetDataset[cardId].name
    });
    
    savePlayers();
    bot.sendMessage(chatId, `🎁 **Card Provision Successful!**\n\nGranted **${targetDataset[cardId].name} (${cleanRarity.toUpperCase()})** to User ID: \`${targetUser}\``, { parse_mode: "Markdown" });
  });

  // ==========================================
  // 🤝 4. USER CARD TRADING SYSTEM 
  // Format: /tradechar UserID | MyCardID | MyCardRarity | TheirCardID | TheirCardRarity
  // Example: /tradechar 554433221 | tanjiro | normal | nezuko | mythic
  // ==========================================
  bot.onText(/\/tradechar (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id.toString();

    const input = match[1].split("|").map(item => item.trim());
    if (input.length < 5) {
      return bot.sendMessage(chatId, "❌ **Format:** \`/tradechar TargetUserID | MyCard | MyCardRarity | TheirCard | TheirCardRarity\`", { parse_mode: "Markdown" });
    }

    const [receiverId, myCard, myRarity, theirCard, theirRarity] = input;
    const cleanMyRarity = myRarity.toLowerCase();
    const cleanTheirRarity = theirRarity.toLowerCase();

    if (senderId === receiverId) {
      return bot.sendMessage(chatId, "❌ Self-trading configurations are restricted paths.");
    }

    const senderProfile = getPlayer(senderId);
    const receiverProfile = getPlayer(receiverId);

    // Validate ownership metrics prior to spinning initialization prompt instances
    const senderOwns = senderProfile.characters.some(c => c.id === myCard && c.rarity === cleanMyRarity);
    const receiverOwns = receiverProfile.characters.some(c => c.id === theirCard && c.rarity === cleanTheirRarity);

    if (!senderOwns) return bot.sendMessage(chatId, `❌ **Trade Cancellation:** You do not own \`${myCard} (${cleanMyRarity})\`!`, { parse_mode: "Markdown" });
    if (!receiverOwns) return bot.sendMessage(chatId, `❌ **Trade Cancellation:** Recipient user does not own \`${theirCard} (${cleanTheirRarity})\`!`, { parse_mode: "Markdown" });

    const tradeId = `trade_${Date.now()}`;
    activeTrades[tradeId] = {
      sender: senderId,
      receiver: receiverId,
      senderCard: myCard,
      senderRarity: cleanMyRarity,
      receiverCard: theirCard,
      receiverRarity: cleanTheirRarity
    };

    bot.sendMessage(chatId, `🤝 **Trade Proposal Dispatched!**\n\n👤 **Sender** offers: \`${myCard} (${cleanMyRarity.toUpperCase()})\`\n👤 **Recipient** offers: \`${theirCard} (${cleanTheirRarity.toUpperCase()})\`\n\n[User ID: ${receiverId}], do you authorize this swap operation?`, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Accept Exchange", callback_data: `trade_accept_${tradeId}` },
            { text: "❌ Decline Swap", callback_data: `trade_decline_${tradeId}` }
          ]
        ]
      }
    });
  });

  // ==========================================
  // 🎮 5. GLOBAL INTERACTIVE CALLBACK ROUTER 
  // ==========================================
  bot.on("callback_query", (query) => {
    const chatId = query.message.chat.id;
    const clickerId = query.from.id.toString();
    const data = query.data;

    // View handler
    if (data.startsWith("vchar_")) {
      const [_, charKey, rarity] = data.split("_");
      const cardData = (rarity === "mythic") ? mythicCards[charKey] : normalCards[charKey];

      if (!cardData) return bot.answerCallbackQuery(query.id, { text: "Card file pointer broken!", show_alert: true });

      const player = getPlayer(clickerId);
      const ownsCard = player.characters.some(c => c.id === charKey && c.rarity === rarity);
      
      const statusText = ownsCard ? "✅ **Status:** You OWN this card!" : "❌ **Status:** You DO NOT own this card!";
      const rarityTag = rarity === "mythic" ? "👑 MYTHIC" : "🟢 NORMAL";
      
      const captionMessage = `✨ **Character:** ${cardData.name || charKey} (${rarityTag})\n` +
                             `❤️ **HP:** ${cardData.hp || 100} | ⚔️ **ATK:** ${cardData.atk || 10}\n\n` +
                             `📝 **Description:** ${cardData.desc || "No custom logs."}\n\n` +
                             `---------------------------\n` +
                             `${statusText}`;

      bot.answerCallbackQuery(query.id);
      const cardImage = cardData.img || cardData.image || cardData.url;

      if (cardImage && cardImage.startsWith("http")) {
        bot.sendPhoto(chatId, cardImage, { caption: captionMessage, parse_mode: "Markdown" });
      } else {
        bot.sendMessage(chatId, captionMessage, { parse_mode: "Markdown" });
      }
    }

    // Trade acceptance router handler logic
    if (data.startsWith("trade_accept_")) {
      const tradeId = data.replace("trade_accept_", "");
      const trade = activeTrades[tradeId];

      if (!trade) return bot.answerCallbackQuery(query.id, { text: "Trade sequence expired or null!", show_alert: true });
      if (clickerId !== trade.receiver) return bot.answerCallbackQuery(query.id, { text: "You are not the designated recipient of this execution setup!", show_alert: true });

      const senderProfile = getPlayer(trade.sender);
      const receiverProfile = getPlayer(trade.receiver);

      // Re-verify assets array placement matrices
      const sIndex = senderProfile.characters.findIndex(c => c.id === trade.senderCard && c.rarity === trade.senderRarity);
      const rIndex = receiverProfile.characters.findIndex(c => c.id === trade.receiverCard && c.rarity === trade.receiverRarity);

      if (sIndex === -1 || rIndex === -1) {
        delete activeTrades[tradeId];
        return bot.sendMessage(chatId, "❌ **Transaction Fault:** Source target components altered state fields. Trade broken.");
      }

      // Execute character swap atomic process block
      const [sCard] = senderProfile.characters.splice(sIndex, 1);
      const [rCard] = receiverProfile.characters.splice(rIndex, 1);

      senderProfile.characters.push(rCard);
      receiverProfile.characters.push(sCard);

      savePlayers();
      delete activeTrades[tradeId];

      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, `🎉 **Trade Finalized Smoothly!**\n\nSwapped structural card nodes between players securely. Verify updated character matrices using \`/char\`.`);
    }

    // Trade decline router logic handler
    if (data.startsWith("trade_decline_")) {
      const tradeId = data.replace("trade_decline_", "");
      const trade = activeTrades[tradeId];

      if (!trade) return bot.answerCallbackQuery(query.id, { text: "Trade reference void.", show_alert: true });
      if (clickerId !== trade.receiver && clickerId !== trade.sender) return bot.answerCallbackQuery(query.id, { text: "Unauthorized vector mapping.", show_alert: true });

      delete activeTrades[tradeId];
      bot.answerCallbackQuery(query.id);
      bot.sendMessage(chatId, "❌ **Trade Request Cancelled Successfully.**");
    }
  });
};
        
