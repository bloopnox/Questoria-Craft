module.exports = {
  name: "inventory",
  description: "View your items",
  execute: async (ctx) => {
    await ctx.reply("🎒 Your inventory is empty (for now).");
  }
};