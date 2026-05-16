module.exports = {
  name: "help",
  description: "Show all commands",
  execute: async (ctx) => {
    await ctx.reply(`
📜 Commands:
/start - Start game
/help - Show commands
/summon - Summon a character
/inventory - View inventory
/battle - Fight a demon
/profile - View profile
    `);
  }
};