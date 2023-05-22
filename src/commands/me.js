const { QuickDB } = require('quick.db');
const db = new QuickDB();
const users = db.table("users");
const bullets = db.table("Bullets");

const config = require("../config.json");
const levels = require("../functions/levels.json");

module.exports = {
  name: "me",
  async run(client, message, room, user, displayname) {

    const database_room = room.replace("!", "").replace(":", "_").replace(".", "_");
    
    // Get amount of regular ducks killed
    let ducks = await users.get(`${user}_${database_room}_ducks_default`);
    if(!ducks || ducks == null) ducks = 0;

    // Get amount of experience points
    let xp = await users.get(`${user}_${database_room}_xp`);
    if(!xp || xp == null) xp = 0;

    // Get the level
    let lvl = await users.get(`${user}_${database_room}_level`);
    if(lvl == null) lvl = 0;

    // Get remaining bullets
    let user_bullets = await bullets.get(`bullets_${database_room}_${user}`);
    if(user_bullets == null) user_bullets = config.dh.default_bullets;

    // Get Personal Best kill time
    let user_kill_time_pb = await users.get(`${user}_${database_room}_killtime`);
    if(user_kill_time_pb == null) user_kill_time_pb = "N/A";

    client.sendEvent(room, "m.room.message", {
      "body": `${displayname}'s statistics\n> Level **${lvl}** with **${xp}** XP and **${ducks}** ducks killed.\n> Accuracy: **${levels[lvl].precision}**%\n> **${user_bullets}** remaining bullets.\n> Best time: **${user_kill_time_pb}**`,
      "msgtype": "m.text",
      "format": "org.matrix.custom.html",
      "formatted_body": `${displayname}'s statistics<blockquote>Level <b>${lvl}</b> with <b>${xp}</b> XP and <b>${ducks}</b> ducks killed.<br>Accuracy: <b>${levels[lvl].precision}</b>%<br><b>${user_bullets}</b> remaining bullets.<br><b>Best time: <b>${user_kill_time_pb}</b></blockquote>`,
    })

  }
}
