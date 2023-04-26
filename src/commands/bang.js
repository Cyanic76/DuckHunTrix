/*
 * commands/bang.js
 *
 * BANG!
*/

const config = require("../config.json");
const strings = require("../functions/strings.json");
const levels = require("../functions/levels.json");
const LevelUtil = require("../functions/level");

const { QuickDB } = require('quick.db');
const db = new QuickDB();
const table = db.table("ducks");
const users = db.table("users");

module.exports = {
  name: "bang",
  async run(client, message, room, user) {
    const ducks = await table.get("ducks");

    // There's no duck in here.
    if(ducks <= 0){
      // Get the string and send it
      let message = strings.bang.noduck.replace("{{XP}}", config.dh.xp.noduck);
      client.sendEvent(room, "m.room.message", {
        "body": `${message}`,
        "msgtype": "m.text"
      });
      // Remove points from the user as they completely deserve it.
      users.sub(`${user}_xp`, config.dh.xp.noduck);
      return;
    }

    // There's at least 1 duck
    table.sub("ducks", 1);
    // Get the user level so we know the accuracy/precision
    let level = await users.get(`${user}_level`);
    if(!level || level == null) level = 0;
    const current_level = levels[level];
    // Get the accuracy
    let random_accuracy = Math.floor(Math.random() * (100 - 0 + 1));
    let accuracy = current_level.precision;

    // If the duck is shot
    if(random_accuracy < accuracy){

      // Get the amount of ducks killed by this user
      const duck = await users.get(`${user}_ducks.default`);
      // Get the string and send it
      let message = strings.bang.duck.replace("{{XP}}", config.dh.xp.duck).replace("{{DUCKS}}", duck);
      client.sendEvent(room, "m.room.message", {
        "body": `${message}`,
        "msgtype": "m.text"
      });
      await users.add(`${user}_xp`, config.dh.xp.duck);
      await users.add(`${user}_ducks`, {default: 1});

      let lvl = users.get(`${user}_level`);
      if(lvl === null) lvl = 0;
      LevelUtil.check(lvl, user, client);

      return;

    } else {

      await users.sub(`${user}_xp`, config.dh.xp.miss);
      let message = strings.bang.miss.replace("{{XP}}", config.dh.xp.miss);
      client.sendEvent(room, "m.room.message", {
        "body": message,
        "msgtype": "m.text"
      });
      return;

    }

  }
}
