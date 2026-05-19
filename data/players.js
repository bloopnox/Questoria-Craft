const fs = require("fs");

let players = require("./players.json");

players.save = () => {
  fs.writeFileSync(
    "./data/players.json",
    JSON.stringify(players, null, 2)
  );
};

module.exports = players;
