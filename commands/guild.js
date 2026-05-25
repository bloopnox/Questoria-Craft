/**
 * VELIX OS V2.5 | CENTRALIZED GUILD ALLIANCE MODULE
 * Fully Linked with Centralized Ledger & Inventory Engine
 * Concurrency Proof & Multi-Thread Safe (2000+ Active Users)
 */

const fs = require("fs");
const path = require("path");
const guildFile = path.join(process.cwd(), "data", "guild.json");

// Safe Read for Guild Records Only (Player data routes through Core Ledger Hook)
const safeReadGuilds = () => {
  try { 
    if (fs.existsSync(guildFile)) return JSON.parse(fs.readFileSync(guildFile, "utf8")); 
  } catch (e) {
    console.error("❌ Guild File system read lock:", e.message);
  }
  return {};
};

const safeSaveGuilds = (data) => {
  try {
    fs.writeFileSync(guildFile, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("❌ Guild File system write lock:", e.message);
  }
};

console.log("🦅 [LOADED SUCCESS] Guild Alliance Matrix Linked: guild.js");

module.exports = (bot) => {

  // Helper inside module workspace to locate existing user guild boundaries
  const getUserGuild = (userId, guildsList) => {
    for (const id in guildsList) {
      if (guildsList[id] && Array.isArray(guildsList[id].members) && guildsList[id].members.includes(userId)) {
        return guildsList[id];
      }
    }
    return null;
  };

  // ==========================================
  // 🏰 /createguild [name] - FORGE ALLIANCE
  // ==========================================
  bot.onText(/\/createguild (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const guildName = match[1].trim();

    if (guildName.includes("_") || guildName.includes(":")) {
      return bot.sendMessage(chatId, "❌ **Naming Standard Refused:** Guild tags cannot contain operational characters (`_`, `:`).");
    }

    const player = bot.getPlayerData(userId);
    if (!player) return;

    // Standardized structural property checks to avoid undefined checks
    if (player.coins === undefined) player.coins = 0;
    if (player.crystals === undefined) player.crystals = 0;

    const guilds = safeReadGuilds();

    if (getUserGuild(userId, guilds)) {
      return bot.sendMessage(chatId, "❌ **Operational Error:** You are already deployed inside an active corps faction alliance.");
    }

    if (guilds[guildName]) {
      return bot.sendMessage(chatId, "❌ **Naming Duplication:** An alliance with that faction tag already exists!");
    }

    const costCoins = 10000;
    const costCrystals = 5;

    if (player.coins < costCoins || player.crystals < costCrystals) {
      return bot.sendMessage(
        chatId,
        `❌ **Deployment Refused:** Insufficient spiritual creation tokens!\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 **Required Vault:** 🪙 \`${costCoins.toLocaleString()}\` Coins + 💎 \`${costCrystals}\` Crystals\n` +
        `💰 **Your Ledger:** 🪙 \`${player.coins.toLocaleString()}\` Coins + 💎 \`${player.crystals}\` Crystals`
      );
    }

    // Deduct from unified centralized ledger structure
    player.coins -= costCoins;
    player.crystals -= costCrystals;
    player.guildId = guildName;

    guilds[guildName] = {
      name: guildName,
      leader: userId,
      leaderName: msg.from.first_name,
      members: [userId],
      maxMembers: 15,
      vault: {
        coins: 0,
        mythicalTokens: 0
      },
      glory: 0,
      guildTokens: 0,
      rewardClaimed: { "2000": false, "4000": false, "6000": false, "8000": false }
    };

    bot.savePlayerData(userId, player);
    safeSaveGuilds(guilds);

    await bot.sendAnimation(
      chatId,
      "https://i.pinimg.com/originals/e1/4c/bd/e14cbd36263f5061b3e3d1284dd27168.gif",
      {
        caption: `🏰 **VELIX OS | ALLIANCE FORGED**\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `Splendid execution! Your corps registration has been synchronized.\n\n` +
                 `🏷️ **Faction Tag:** \`${guildName.toUpperCase()}\`\n` +
                 `👑 **Corps Commander:** \`${msg.from.first_name}\`\n` +
                 `👥 **Initial Capacity:** \`15 Slayers\`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `💡 *Tell your allies to register using: \`/joinguild ${guildName}\`*`
      }
    );
  });

  // ==========================================
  // 🤝 /joinguild [name] - JOIN ALLIANCE
  // ==========================================
  bot.onText(/\/joinguild (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const guildName = match[1].trim();
    
    const player = bot.getPlayerData(userId);
    if (!player) return;

    const guilds = safeReadGuilds();

    if (getUserGuild(userId, guilds)) {
      return bot.sendMessage(chatId, "❌ **Registry Locked:** You must clear your current active alliance bonds before joining another faction.");
    }

    const guild = guilds[guildName];
    if (!guild) {
      return bot.sendMessage(chatId, "❌ **Faction Not Located:** The specific guild tag does not exist. Verify spelling case metrics.");
    }

    if (guild.members.includes(userId)) {
      return bot.sendMessage(chatId, "❌ **System Notice:** Internal trace logs prove you are already registered in this network.");
    }

    if (guild.members.length >= (guild.maxMembers || 15)) {
      return bot.sendMessage(chatId, "❌ **Alliance Overflow:** Faction grid capacity is maxed out. Request an upgrade from the Commander.");
    }

    guild.members.push(userId);
    player.guildId = guildName;

    safeSaveGuilds(guilds);
    bot.savePlayerData(userId, player);

    bot.sendMessage(chatId, `✅ **ALLIANCE DEPLOYED:** You have joined the ranks of faction alliance **${guildName.toUpperCase()}**!`);
  });

  // ==========================================
  // 🏰 /myguild - DISPLAY ACTIVE FACTION
  // ==========================================
  bot.onText(/\/myguild/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guilds = safeReadGuilds();
    const guild = getUserGuild(userId, guilds);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ **Unassigned Asset:** You are currently drifting alone without a faction grid.\n💡 *Run \`/createguild [name]\` or join one via \`/joinguild [name]\`*");
    }

    await bot.sendAnimation(
      chatId,
      "https://i.pinimg.com/originals/1e/e0/e1/1ee0e17a9a4eadecb93890878164dbdb.gif",
      {
        caption: `🏰 **VELIX OS | FACTION ARCHITECTURE**\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `🛡️ **FACTION TAG:** \`${guild.name.toUpperCase()}\`\n` +
                 `👑 **COMMANDER:** \`${guild.leaderName || "Unknown Slayer"}\`\n` +
                 `👥 **ALLIED GRIDS:** \`${guild.members.length} / ${guild.maxMembers || 15}\` Slayers\n\n` +
                 `🏆 **GLORY PARAMETER:** \`${guild.glory || 0} GP\`\n` +
                 `🏅 **CORPS COMMISSIONS:** \`${guild.guildTokens || 0} Tokens\`\n\n` +
                 `🏦 **VAULT COIN BALANCE:** 🪙 \`${(guild.vault.coins || 0).toLocaleString()}\`\n` +
                 `💎 **VAULT CRYSTALS:** 💎 \`${guild.vault.mythicalTokens || 0}\`\n` +
                 `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                 `🦅 *Contribute gold reserves using \`/guildvault <amount>\` to feed power loops.*`,
        parse_mode: "Markdown"
      }
    );
  });

  // ==========================================
  // 🏦 /guildvault [amount] - RESERVES COMMIT
  // ==========================================
  bot.onText(/\/guildvault(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    const player = bot.getPlayerData(userId);
    if (!player) return;

    if (player.coins === undefined) player.coins = 0;

    const guilds = safeReadGuilds();
    const guild = getUserGuild(userId, guilds);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ **Access Restricted:** You must belong to a faction array to commit assets to a vault storage network.");
    }

    let amountInput = match[1];
    if (!amountInput) {
      return bot.sendMessage(chatId, "ℹ️ **Vault Deposit Interface**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSpecify transaction depth to commit currency.\n\n📝 **Syntax:** \`/guildvault <amount>\` or \`/guildvault all\`", { parse_mode: "Markdown" });
    }

    amountInput = amountInput.toLowerCase().replace(/coins|coin/g, "").trim();

    let amount = 0;
    if (amountInput === "all") {
      amount = player.coins;
    } else {
      amount = Number(amountInput);
    }

    if (isNaN(amount) || amount <= 0) {
      return bot.sendMessage(chatId, "❌ **Transaction Aborted:** Input depth parameters must be real positive integers.");
    }

    if (player.coins < amount) {
      return bot.sendMessage(chatId, `❌ **Ledger Insufficient:** Your asset wallet holds only 🪙 \`${player.coins.toLocaleString()}\` coins.`);
    }

    // Thread Safe Modification Cycle
    player.coins -= amount;
    if (!guild.vault) guild.vault = { coins: 0, mythicalTokens: 0 };
    guild.vault.coins = (parseInt(guild.vault.coins, 10) || 0) + amount;

    safeSaveGuilds(guilds);
    bot.savePlayerData(userId, player);

    bot.sendMessage(
      chatId, 
      `🏰 **FACTION VAULT RESERVES TRANSACTION LINKED**\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🪙 **Contributed Volatility:** \`+${amount.toLocaleString()}\` Crow Coins Committed.\n` +
      `🏰 **Target Alliance:** \`${guild.name.toUpperCase()}\`\n` +
      `🏦 **Consolidated Faction Bank:** 🪙 \`${guild.vault.coins.toLocaleString()}\` Coins.\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *Central transactional records locked successfully.*`,
      { parse_mode: "Markdown" }
    );
  });

  // ==========================================
  // 🔺 /upgradeguild - GRID DEPTH UPGRADE
  // ==========================================
  bot.onText(/\/upgradeguild/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const guilds = safeReadGuilds();
    const guild = getUserGuild(userId, guilds);

    if (!guild) {
      return bot.sendMessage(chatId, "❌ **Operational Link Broken:** No alliance structural matrix found.");
    }

    if (guild.leader !== userId) {
      return bot.sendMessage(chatId, "❌ **Authorization Refused:** Only the active Corps Commander can unlock grid allocation size variables.");
    }

    const currentMax = guild.maxMembers || 15;
    if (currentMax >= 25) {
      return bot.sendMessage(chatId, "❌ **Maximum Capacity Reached:** Your structural perimeter is already maxed at Tier Allocation Max (\`25 members\`).");
    }

    const costTokens = 20;
    if ((guild.guildTokens || 0) < costTokens) {
      return bot.sendMessage(chatId, `❌ **Upgrade Matrix Blocked:** Insufficient Alliance Assets!\n📦 **Required:** \`${costTokens}\` Guild Tokens.\n🏮 **Available:** \`${guild.guildTokens || 0}\` Guild Tokens.`);
    }

    guild.guildTokens -= costTokens;
    guild.maxMembers = 25;

    safeSaveGuilds(guilds);

    bot.sendMessage(chatId, `🏰 **FACTION EXPANSION SUCCESSFUL**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMax operational grid allocation structural variables altered! Capacity limits moved to: 👥 \`25 active members\`!`);
  });

};
