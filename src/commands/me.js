const sdk = require("matrix-js-sdk");
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const users = db.table("users");

module.exports = {
  name: "me",
  async run(client, message, room, user) {
    
    let ducks = await users.get(`${user}_ducks_default`);
    if(!ducks || ducks == null) ducks = 0;

    let xp = await users.get(`${user}_ducks_default`);
    if(!xp || xp == null) xp = 0;

    client.sendEvent(room, "m.room.message", {
      "body": `You have ${xp} XP and killed ${ducks} ducks.`,
      "msgtype": "m.text"
    })

  }
}
