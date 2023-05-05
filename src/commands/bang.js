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
const bullets = db.table("Bullets");
const users = db.table("users");

module.exports = {
  name: "bang",
  async run(client, message, room, user) {

    // Get the amount of ducks present in the room.
    const database_room = room.replace("!", "").replace(":", "_").replace(".", "_");
    const ducks = await table.get(`ducks_${database_room}`);

    // Get the amount of available bullets.
    const user_bullets = await bullets.get(`bullets_${database_room}_${user}`);
    if(user_bullets <= 0){
      client.sendEvent(room, "m.room.message", {
        "body": `${strings.bang.nobullet}`,
        "msgtype": "m.text"
      });
      return false;
    }
    
    // Remove 1 bullet.
    if(user_bullets == null){
      // If user hasn't used this yet, automatically remove 1 bullet as well.
      await bullets.set(`bullets_${database_room}_${user}`, config.dh.default_bullets-1);
    } else {
      // If user has used this at least once.
      await bullets.sub(`bullets_${database_room}_${user}`, 1);
    }

    // There's no duck in here.
    if(ducks <= 0 || ducks == null){
      // Get the string and send it
      let message = strings.bang.noduck.replace("{{XP}}", config.dh.xp.noduck);
      client.sendEvent(room, "m.room.message", {
        "body": `${message}`,
        "msgtype": "m.text"
      });
      // Remove points from the user as they completely deserve it.
      users.sub(`${user}_${database_room}_xp`, config.dh.xp.noduck);
      return;
    }

    // There's at least 1 duck

    // Get the user level so we know the accuracy/precision
    let level = await users.get(`${user}_${database_room}_level`);
    if(!level || level == null) level = 0;
    const current_level = levels[level];
    // Get the accuracy
    let random_accuracy = Math.floor(Math.random() * (100 - 0 + 1));
    let accuracy = current_level.precision;

    // If the duck is shot
    if(random_accuracy < accuracy){

      // Get the amount of ducks killed by this user
      let duck = await users.get(`${user}_${database_room}_ducks_default`);
      if(duck == null){
        await users.set(`${user}_${database_room}_ducks_default`, 1);
        duck = 1;
      }
      // Get the message and send it
      let message = strings.bang.duck.replace("{{XP}}", config.dh.xp.duck).replace("{{DUCKS}}", duck);
      client.sendEvent(room, "m.room.message", {
        "body": `${message}`,
        "msgtype": "m.text"
      });
      await users.add(`${user}_${database_room}_xp`, config.dh.xp.duck);
      await users.add(`${user}_${database_room}_ducks_default`, 1);
      await table.sub(`ducks_${database_room}`, 1);

      // Remove the first duck from array so we keep the right order
      let current = await table.get(`duckOrder_${database_room}`);
      if(current != null){
        current.shift();
      } else current = [];
      await table.set(`duckOrder_${database_room}`, current);

      let lvl = users.get(`${user}_${database_room}_level`);
      if(lvl === null) lvl = 0;
      LevelUtil.check(lvl, user, client);

      return;

    } else {

      await users.sub(`${user}_${database_room}_xp`, config.dh.xp.miss);
      let message = strings.bang.miss.replace("{{XP}}", config.dh.xp.miss);
      client.sendEvent(room, "m.room.message", {
        "body": message,
        "msgtype": "m.text"
      });
      return;

    }

  }
}
