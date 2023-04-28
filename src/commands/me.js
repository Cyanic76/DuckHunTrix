const { QuickDB } = require('quick.db');
const db = new QuickDB();
const users = db.table("users");
const levels = require("../functions/levels.json");

module.exports = {
  name: "me",
  async run(client, message, room, user) {
    
    // Get amount of regular ducks killed
    let ducks = await users.get(`${user}_ducks_default`);
    if(!ducks || ducks == null) ducks = 0;

    // Get amount of experience points
    let xp = await users.get(`${user}_ducks_default`);
    if(!xp || xp == null) xp = 0;

    // Get the level
    let lvl = await users.get(`${user}_level`);
    if(lvl == null) lvl = 0;

    client.sendEvent(room, "m.room.message", {
      "body": `${user}'s statistics\n> Level **${lvl}** with **${xp}** XP and **${ducks}** ducks killed.\n> Accuracy: **${levels[lvl].precision}**%`,
      "msgtype": "m.text",
      "format": "org.matrix.custom.html",
      "formatted_body": `${user}'s statistics<blockquote>Level <b>${lvl}</b> with <b>${xp}</b> XP and <b>${ducks}</b> ducks killed.<br>Accuracy: <b>${levels[lvl].precision}</b>%</blockquote>`,
    })

  }
}
