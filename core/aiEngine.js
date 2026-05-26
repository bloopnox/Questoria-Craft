require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let model;

async function initModel() {
  try {
    const res = await genAI.listModels();
    console.log("AVAILABLE MODELS:", res);

    // pick first working model automatically
    const first = res.models?.find(m =>
      m.name.includes("gemini") &&
      m.supportedGenerationMethods?.includes("generateContent")
    );

    if (!first) {
      throw new Error("No usable Gemini model found for this API key");
    }

    model = genAI.getGenerativeModel({ model: first.name });
    console.log("✅ USING MODEL:", first.name);

  } catch (err) {
    console.log("INIT ERROR:", err);
  }
}

async function askJarvis(prompt) {
  try {
    if (!model) {
      return "⚠️ AI not initialized yet.";
    }

    const result = await model.generateContent(
      `You are Jarvis inside a Demon Slayer Telegram bot. Reply short and helpful.\nUser: ${prompt}`
    );

    return result.response.text();

  } catch (err) {
    console.log("JARVIS ERROR:", err.message);
    return "⚠️ Jarvis is currently offline.";
  }
}

initModel();

module.exports = askJarvis;
