const players = require("../data/players");

const getCharacters = () => {
  const owner = players["2086993762"];

  if (!owner || !owner.inventory) return [];

  return owner.inventory.map(c => {
    const [name, image, type] = c.split("|");
    return { name, image, type };
  });
};

module.exports = (bot) => {

  // =========================
  // LIST ALL CHARACTERS
  // =========================
  bot.onText(/\/char$/, (msg) => {
    const chars = getCharacters();

    if (chars.length === 0) {
      return bot.sendMessage(msg.chat.id, "❌ No characters found");
    }

    let text = "📦 Characters List\n\n";

    chars.forEach(c => {
      text += `⚔️ ${c.name} (${c.type})\n`;
    });

    bot.sendMessage(msg.chat.id, text);
  });

  // =========================
  // VIEW SINGLE CHARACTER
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

    // if only one result
    if (results.length === 1) {
      const c = results[0];

      return bot.sendPhoto(msg.chat.id, c.image, {
        caption: `⚔️ ${c.name}\n📁 ${c.type}`
      });
    }

    // multiple results
    let text = "🔎 Multiple found:\n\n";

    results.forEach(c => {
      text += `⚔️ ${c.name} (${c.type})\n`;
    });

    bot.sendMessage(msg.chat.id, text);
  });

};
