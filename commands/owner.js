const fs = require("fs");
const path = require("path");

const playersPath = path.join(__dirname, "../data/players.json");
const guildsPath = path.join(__dirname, "../data/guild.json");

let players = JSON.parse(fs.readFileSync(playersPath, "utf8"));
let guilds = JSON.parse(fs.readFileSync(guildsPath, "utf8"));

const saveAll = () => {
  fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
  fs.writeFileSync(guildsPath, JSON.stringify(guilds, null, 2));
};

const OWNER_ID = "2086993762";
const isOwner = (msg) => msg.from.id.toString() === OWNER_ID;

const getPlayer = (id) => {
  if (!players[id]) {
    players[id] = { coins: 0, mythicalCrystals: 0, inventory: [], level: 1, xp: 0 };
    saveAll();
  }
  return players[id];
};

module.exports = (bot) => {
  bot.onText(/\/owner/, (msg) => {
    if (!isOwner(msg)) return;
    bot.sendAnimation(
      msg.chat.id,
      "https://i.pinimg.com/originals/e2/f7/45/e2f745698b639d14dbd4c1567e5f03d6.gif",
      {
        caption: `👑 OWNER PANEL\n\n💰 /addcoins ID AMOUNT\n💰 /removecoins ID AMOUNT\n💎 /addtokens ID AMOUNT\n💎 /removetokens ID AMOUNT\n\n🧬 /addcharacter USERID Name|Image|Type\n🗑️ /removecharacter USERID CharacterID\n\n👤 /checkplayer ID\n🔄 /resetplayer ID\n\n🏰 /deleteguild NAME`
      }
    );
  });

  bot.onText(/\/myid/, (msg) => bot.sendMessage(msg.chat.id, `🆔 ${msg.from.id}`));

  bot.onText(/\/addcoins (\d+) (\d+)/, (msg, match) => {
    if (!isOwner(msg)) return;
    const p = getPlayer(match[1]);
    p.coins += parseInt(match[2]);
    saveAll();
    bot.sendMessage(msg.chat.id, "✅ Coins added");
  });

  bot.onText(/\/addcharacter (\d+) (.+)/, (msg, match) => {
    if (!isOwner(msg)) return;
    const userId = match[1];
    const input = match[2].split("|");
    if (input.length < 3) return bot.sendMessage(msg.chat.id, "❌ Format: /addcharacter USERID Name|Image|Type");
    const p = getPlayer(userId);
    const charId = "c" + Date.now();
    p.inventory.push(`${charId}|${input[0].trim()}|${input[1].trim()}|${input[2].trim()}`);
    saveAll();
    bot.sendMessage(msg.chat.id, `✅ Added ${input[0].trim()}\n🆔 ${charId}`);
  });

  bot.onText(/\/resetplayer (\d+)/, (msg, match) => {
    if (!isOwner(msg)) return;
    delete players[match[1]];
    saveAll();
    bot.sendMessage(msg.chat.id, "🔄 Player reset done");
  });
};