const players = require("../data/players");

// =========================
// GET CHARACTERS
// =========================
const getCharacters = () => {
  const owner = players["2086993762"];

  if (!owner || !owner.inventory) return [];

  return owner.inventory.map(c => {
    const [id, name, type] = c.split("|");
    return { id, name, type };
  });
};

module.exports = (bot) => {

  // =========================
  // LIST ALL
  // =========================
  bot.onText(/\/char$/, (msg) => {
    const chars = getCharacters();

    if (chars.length === 0) {
      return bot.sendMessage(msg.chat.id, "❌ No characters found");
    }

    let text = "📦 All Characters\n\n";

    chars.forEach(c => {
      text += `🆔 ${c.id}\n⚔️ ${c.name} (${c.type})\n\n`;
    });

    bot.sendMessage(msg.chat.id, text);
  });

  // =========================
  // SEARCH FIX HERE
  // =========================
  bot.onText(/\/char (.+)/, (msg, match) => {
    const query = match[1].toLowerCase();

    const chars = getCharacters();

    const results = chars.filter(c =>
      c.name.toLowerCase().includes(query)
    );

    if (results.length === 0) {
      return bot.sendMessage(msg.chat.id, "❌ No character found");
    }

    if (results.length === 1) {
      const c = results[0];

      return bot.sendMessage(
        msg.chat.id,
        `🆔 ${c.id}\n⚔️ ${c.name}\n📁 ${c.type}`
      );
    }

    let text = "🔎 Multiple found:\n\n";

    results.forEach(c => {
      text += `🆔 ${c.id}\n⚔️ ${c.name} (${c.type})\n\n`;
    });

    bot.sendMessage(msg.chat.id, text);
  });

};
