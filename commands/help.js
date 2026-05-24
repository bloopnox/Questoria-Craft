console.log("✅ VELIX OS | DEMON SLAYER HELP COURIER [UI v2.6 - COMPLETE HUB]");

module.exports = (bot) => {

  // ==========================================
  // 💮 MAIN HELP HUB DIAL
  // ==========================================
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    const image = "https://i.pinimg.com/1200x/5e/3d/77/5e3d77131f4866906087659fddc0ff3c.jpg"; 

    const caption = `💮 **DEMON SLAYER CORPS | ARCHIVE HUB** 💮\n` +
                    `*“Welcome, recruit. Tap the scrolls below to interface with the headquarters mainframe protocols.”*\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `📜 **SELECT A SYSTEM DIRECTIVE Below** 👇\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    bot.sendPhoto(chatId, image, {
      caption: caption,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🏰 Faction Guilds", callback_data: "help_guild" },
            { text: "🪙 Forge Economy", callback_data: "help_economy" }
          ],
          [
            { text: "👤 Slayer Profile", callback_data: "help_profile" },
            { text: "⚔️ Breath Combat", callback_data: "help_battle" }
          ],
          [
            { text: "🦅 Crow Directives", callback_data: "help_guide" },
            { text: "🏆 Pillar Rankings", callback_data: "help_lb" }
          ],
          [
            { text: "🌐 Master Strategy Docs", url: "https://example.com/rpg-bot-docs" }
          ]
        ]
      }
    });
  });

  // ==========================================
  // 💮 SUB-SYSTEM PANEL RECEIVER
  // ==========================================
  bot.on("callback_query", (q) => {
    const chatId = q.message.chat.id;
    const data = q.data;

    if (!data.startsWith("help_")) return;

    let text = "";

    if (data === "help_guild") {
      text = `🏰 **GUILD SYSTEM | FACTION LABELS** 🏰\n` +
             `*Form your clan or align with existing cells to unlock group milestones.*\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
             `📜 **SLAYER OPERATIONS:**\n` +
             `├─ \`/createguild <name>\` ➜ Found your own custom faction\n` +
             `├─ \`/joinguild <name>\` ➜ Enlist in an active user alliance\n` +
             `├─ \`/myguild\` ➜ Check alignment, rosters, and vault metrics\n` +
             `├─ \`/guildvault <amt>\` ➜ Tribute Crow Coins to the group treasury\n` +
             `├─ \`/guildrewards\` ➜ Inspect current weekly glory milestones\n` +
             `├─ \`/claimguildrewards\` ➜ Harvest unlocked treasury matrices\n` +
             `└─ \`/guildlb\` ➜ Rank factions sorted by vault capacity\n\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    if (data === "help_economy") {
      text = `🪙 **ECONOMY & METALLURGY SYSTEM** 🪙\n` +
             `*Manage your funds and forge parameters inside the Corps vaults.*\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
             `💰 **FINANCIAL REGISTERS:**\n` +
             `├─ \`/balance\` / \`/bal\` ➜ Verify Crow Coins, Crystals & Tokens\n` +
             `├─ \`/work\` ➜ Complete Butterfly Mansion shifts for cash assets\n` +
             `├─ \`/spin\` ➜ Engage Nichirin Slots (Cost: \`1200 Coins\` / \`5 Tokens\`)\n` +
             `├─ \`/dep <amt/all>\` ➜ Move pocket cash secure into your bank storage\n` +
             `├─ \`/with <amt/all>\` ➜ Extract emergency liquidity back to wallet\n` +
             `├─ \`/essence <name>\` ➜ View character specific Wisteria Serum stock\n` +
             `└─ \`/blessing <name>\` ➜ View character specific Nichirin Ore stock\n\n` +
             `🔄 **FORGER CONVERT CORE:**\n` +
             `├─ \`/convert c2cr <amt>\` ➜ \`100 Coins\` ➡️ \`1 Nichirin Crystal\`\n` +
             `└─ \`/convert cr2mt <amt>\` ➜ \`100 Crystals\` ➡️ \`1 Mythic Essence\`\n\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    if (data === "help_profile") {
      text = `👤 **SLAYER PROFILES & ARSENAL** 👤\n` +
             `*Track your growth, breathe style variations, and equipped items.*\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
             `🎴 **LEDGER UTILITIES:**\n` +
             `├─ \`/profile\` ➜ View rank passport, levels, live XP & status cards\n` +
             `├─ \`/inventory\` ➜ Inspect your stored drops, ores & serum reserves\n` +
             `├─ \`/char\` ➜ List every indexed card database entry\n` +
             `├─ \`/char <name/id>\` ➜ Inspect specific character stats and records\n` +
             `└─ \`/equip\` ➜ Fasten unlocked weapons & trinkets to your slot\n\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    if (data === "help_battle") {
      text = `⚔️ **BREATH COMBAT ENGINE** ⚔️\n` +
             `*Deploy sword disciplines against rogue targets across the forest.*\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
             `👹 **OFFENSIVE DRIVES:**\n` +
             `├─ \`/battle\` ➜ Face enemy combatants for dynamic Coin/XP drops\n` +
             `└─ \`/hunt\` ➜ Execute special threat missions to satisfy tasks\n\n` +
             `🛠️ **PILLAR ADMINISTRATIVE BLOCK:**\n` +
             `└─ \`/battle_toggle\` ➜ Lock/Unlock skirmish commands inside this room\n\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    if (data === "help_guide") {
      text = `🦅 **KASUGAI CROW DIRECTIVES** 🦅\n` +
             `*Headquarter dispatches updated automatically every solar loop.*\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
             `📜 **MISSION MONITORING:**\n` +
             `├─ \`/task\` ➜ Check progress benchmarks on active training orders\n` +
             `└─ \`/guide\` ➜ Launch visual step-by-step interactive logs\n\n` +
             `🎁 **WEEKLY PERFORMANCE BONUS:**\n` +
             `💡 *Fulfill directives to automatically draw \`+20 Tokens\` & \`+50 XP\`!*\n\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    if (data === "help_lb") {
      text = `🏆 **LEADERBOARD RECOGNITION** 🏆\n` +
             `*See who stands at the peak of the Slayer Corps standings.*\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
             `📊 **RANK NETWORKS:**\n` +
             `└─ \`/guildlb\` ➜ Ranks elite factions based on accumulated bank vaults\n\n` +
             `━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    }

    if (text) {
      bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
    }
    
    bot.answerCallbackQuery(q.id);
  });

};
