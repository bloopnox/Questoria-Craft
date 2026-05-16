module.exports = {
  name: "profile",
  description: "View your profile",
  execute: async (ctx) => {
    await ctx.reply("👤 Profile:\nLevel: 1\nXP: 0");
  }
};