const characters = require("../assets/data/characters.json");

module.exports = {
  name: "summon",
  description: "Summon a random character",
  execute: async (ctx) => {
    const random = characters[Math.floor(Math.random() * characters.length)];

    await ctx.reply(`✨ You summoned: ${random.name}`);
  }
};