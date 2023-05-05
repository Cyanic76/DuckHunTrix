/*
 * functions/level.js
 *
 * Check for the next level for users.
 * When they reach the next level, it gets updated in the database
 * and the stats of that new level get sent to the room.
*/

const levels = require("../functions/levels.json");
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const users = db.table("users");

function check(level, user, client, room) {
  // Formula for the current level: 10x + 4x²
  let requiredXp = 10*(level+1) + (4*(level+1))^2;
  const xp = users.get(`${user}_xp`);

  // If the user reaches a new level
  if(xp > requiredXp){
    let newLevel = level+1;
    // Get the data for the new level
    let newLevelData = levels[newLevel];
    // Send it to the room
    client.sendMessage(room, `You reached level ${newLevel}! Your accuracy is ${newLevelData.precision}%.`);
    // Set the level for the user
    users.set(`${user}_level`, newLevel);
  }
}

module.exports = { check };
