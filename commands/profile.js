const { Canvas, loadImage } = require("skia-canvas");
const players = require("../data/players");

module.exports = (bot) => {

  bot.onText(/\/profile/, async (msg) => {

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const user = msg.from;

    if (!players[userId]) {
      players[userId] = {
        coins: 1000,
        gems: 0,
        mythicalCrystals: 5,
        cards: [],
        character: "Not Selected",
        level: 1,
        xp: 0,
        rank: "Rookie"
      };
    }

    const p = players[userId];

    try {

      // =========================
      // CANVAS
      // =========================
      const canvas = new Canvas(900, 500);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#0b0f1a";
      ctx.fillRect(0, 0, 900, 500);

      // Card box
      ctx.fillStyle = "#1a2233";
      ctx.fillRect(40, 40, 820, 420);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px Arial";
      ctx.fillText("⚔️ DEMON SLAYER PROFILE", 60, 90);

      // LEFT INFO
      ctx.font = "20px Arial";
      ctx.fillText(`Name: ${user.first_name}`, 60, 150);
      ctx.fillText(`ID: ${userId}`, 60, 185);
      ctx.fillText(`Character: ${p.character}`, 60, 220);
      ctx.fillText(`Level: ${p.level}`, 60, 255);
      ctx.fillText(`XP: ${p.xp}/100`, 60, 290);
      ctx.fillText(`Rank: ${p.rank}`, 60, 325);

      // RIGHT INFO
      ctx.fillText(`Coins: ${p.coins}`, 520, 200);
      ctx.fillText(`Gems: ${p.gems}`, 520, 240);
      ctx.fillText(`Crystals: ${p.mythicalCrystals}`, 520, 280);
      ctx.fillText(`Cards: ${p.cards.length}`, 520, 320);

      // =========================
      // PROFILE PHOTO (CIRCLE)
      // =========================
      const photos = await bot.getUserProfilePhotos(userId);

      if (photos.total_count > 0) {

        const fileId = photos.photos[0][0].file_id;
        const fileLink = await bot.getFileLink(fileId);

        const avatar = await loadImage(fileLink);

        ctx.save();
        ctx.beginPath();
        ctx.arc(720, 120, 70, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(avatar, 650, 50, 140, 140);
        ctx.restore();
      }

      // FOOTER
      ctx.fillStyle = "#00ffcc";
      ctx.font = "bold 22px Arial";
      ctx.fillText("🔥 DEMON SLAYER BOT 🔥", 300, 470);

      // =========================
      // SEND IMAGE
      // =========================
      const buffer = await canvas.toBuffer("image/png");

      await bot.sendPhoto(chatId, buffer, {
        caption: "👤 Your Slayer Profile Card"
      });

    } catch (err) {
      console.log(err);
      bot.sendMessage(chatId, "Profile generate nahi hua 😓");
    }

  });

};
