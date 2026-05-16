module.exports = {
  name: "start",
  description: "Start the game",
  execute: async (ctx) => {
    await ctx.reply("🔥 Welcome to Demon Slayer Bot!\nUse /help to see commands.");
  }
};