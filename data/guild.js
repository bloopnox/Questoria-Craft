const fs = require("fs");
const path = require("path");

// Path ko dynamic banao taaki server kahin bhi ho, error na aaye
const guildFilePath = path.join(__dirname, "../data/guild.json");

// Function: File se fresh data uthao (Cache bypass)
const getGuilds = () => {
    try {
        if (!fs.existsSync(guildFilePath)) return {};
        const data = fs.readFileSync(guildFilePath, "utf8");
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
};

// Function: Data save karo
const saveGuilds = (data) => {
    try {
        fs.writeFileSync(guildFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
        console.error("❌ Guilds save error:", e);
    }
};

// Export ek object ki tarah karo taaki har file mein latest data mile
module.exports = {
    get: getGuilds,
    save: saveGuilds
};
