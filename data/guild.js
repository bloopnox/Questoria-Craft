const fs = require("fs");

let guilds = require("./guilds.json");

guilds.save = () => {
  fs.writeFileSync(
    "./data/guilds.json",
    JSON.stringify(guilds, null, 2)
  );
};

module.exports = guilds;
