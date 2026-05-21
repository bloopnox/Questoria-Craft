const demons = require("../assets/demons");

module.exports = (bot) => {
  bot.onText(/\/battle/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;

    // 🎲 Random Demon
    const demon = demons[Math.floor(Math.random() * demons.length)];

    // 🧍 Player Stats
    const player = {
      name: user.first_name,
      hp: 120,
      attack: 25,
      defense: 10,
      level: Math.floor(Math.random() * 30) + 1,
    };

    let playerHp = player.hp;
    let demonHp = demon.hp;

    let battleLog = `⚔️ BATTLE STARTED ⚔️

🧍 Slayer: ${player.name}
✨ Level: ${player.level}

👹 Demon Encountered:
${demon.name}
🏷 Rank: ${demon.rank}
⚡ Type: ${demon.type}

❤️ HP: ${demon.hp}
🗡 Attack: ${demon.attack}
🛡 Defense: ${demon.defense}
💨 Speed: ${demon.speed}

🔥 Abilities:
${demon.abilities.map(a => `• ${a}`).join("\n")}

━━━━━━━━━━━━━━━
`;

    try {

      // 📸 Demon Image
      await bot.sendPhoto(chatId, demon.image, {
        caption: `🌌 A Demon Appeared!

👹 ${demon.name}

🏷 Rank: ${demon.rank}
⚡ Type: ${demon.type}
✨ Rarity: ${demon.rarity}`,
      });

      // ⚔️ Fight Loop
      while (playerHp > 0 && demonHp > 0) {

        // Player Attack
        const playerDamage =
          Math.max(5, player.attack - Math.floor(demon.defense / 2));

        demonHp -= playerDamage;

        if (demonHp < 0) demonHp = 0;

        battleLog += `🗡 You attacked ${demon.name}
💥 -${playerDamage} HP
❤️ Demon HP: ${demonHp}

`;

        if (demonHp <= 0) break;

        // Demon Attack
        const demonDamage =
          Math.max(3, demon.attack - Math.floor(player.defense / 2));

        playerHp -= demonDamage;

        if (playerHp < 0) playerHp = 0;

        battleLog += `👹 ${demon.name} attacked back!
💥 -${demonDamage} HP
❤️ Your HP: ${playerHp}

`;

        // 🔥 Ability Chance
        if (Math.random() < 0.25) {

          const skill =
            demon.abilities[
              Math.floor(Math.random() * demon.abilities.length)
            ];

          const extra = Math.floor(Math.random() * 10) + 5;

          playerHp -= extra;

          if (playerHp < 0) playerHp = 0;

          battleLog += `🔥 ${demon.name} used ${skill}!
💢 Extra Damage: ${extra}
❤️ Your HP: ${playerHp}

`;
        }
      }

      // 🏆 Results
      if (playerHp > 0) {

        const reward =
          Math.floor(demon.hp / 2) +
          Math.floor(Math.random() * 100);

        const exp =
          Math.floor(demon.attack * 2) +
          Math.floor(Math.random() * 50);

        battleLog += `━━━━━━━━━━━━━━━

🏆 VICTORY!

👹 Defeated ${demon.name}

💰 Rewards:
🪙 ${reward} Coins
✨ ${exp} EXP

❤️ Remaining HP: ${playerHp}`;

      } else {

        battleLog += `━━━━━━━━━━━━━━━

☠️ DEFEAT!

${demon.name} defeated you...

💔 Better luck next time.`;
      }

      // ⏳ Send Battle Log
      setTimeout(() => {
        bot.sendMessage(chatId, battleLog);
      }, 2000);

    } catch (error) {

      console.log(error);

      bot.sendMessage(
        chatId,
        "❌ Battle failed."
      );
    }
  });
};
