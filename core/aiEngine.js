require("dotenv").config();
const Groq = require("groq-sdk");

// =========================
// 🤖 GROQ AI CLIENT
// =========================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =========================
// ⚡ JARVIS AI FUNCTION
// =========================
async function askJarvis(prompt, userId = null) {
  try {
    if (!prompt) return "⚠️ No input received.";

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are Jarvis, a smart AI assistant inside a Demon Slayer RPG Telegram bot. Keep replies short, natural, slightly cool, and helpful. Do not give long essays.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 250,
    });

    return completion.choices[0].message.content;

  } catch (err) {
    console.log("🔥 JARVIS ERROR:", err.message);

    return "⚠️ Jarvis is currently offline. Try again later.";
  }
}

module.exports = askJarvis;
