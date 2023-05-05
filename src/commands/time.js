/*
 * commands/bang.js
 *
 * BANG!
*/

const config = require("../config.json");

const { QuickDB } = require('quick.db');
const db = new QuickDB();
const bullets = db.table("Bullets");

module.exports = {
  name: "time",
  async run(client, message, room, user) {

    // Get the bullet number so the user can view it
    let user_bullets = await bullets.get(`bullets_${user}`);
    // If null, they may not have played today so set it to default.
    if(user_bullets == null) user_bullets = config.dh.default_bullets;

    // Get tomorrow's date at 00:00:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);

    // Get current date & time
    const now = Date.now();

    // Get the difference
    const diff = new Date(tomorrow.valueOf() - now);
    const diff_h = diff.getHours();
    let diff_m = diff.getMinutes();
    let diff_s = diff.getSeconds();
    if(diff_m < 10) diff_m = "0" + diff_m;
    if(diff_s < 10) diff_s = "0" + diff_s;

    // Send the diff and bullet amount
    client.sendEvent(room, "m.room.message", {
      "body": `Remaining time: ${diff_h}:${diff_m}:${diff_s} - You currently have ${user_bullets} bullets.`,
      "msgtype": "m.text"
    });

  }
}