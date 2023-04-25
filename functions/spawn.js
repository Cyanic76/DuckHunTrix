/*
 * functions/spawn.js
 *
 * The Duck Manager.
*/

// DB
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const table = db.table("ducks");

// Other files
const config = require("../config.json");
const strings = require("../functions/strings.json");

// How many ducks in the room?
let ducks = 0;
table.set("ducks", 0);

function start(client) {
  // room => ID of the specified room
  spawn("!tbNFZiSqysFtpzYsta:matrix.org", client);
  console.log(client.sendEvent);
}

function rnd() {
  return Math.floor(Math.random() * (10 - 0 + 1));
}

function spawn(room, client) {
  let random = -1;

  // Generate "random" numbers
  setInterval(() => {
    random = rnd();
    if(config.log.show_random_spawn == true) console.log(random);

    // If we get lucky, then we spawn a duck
    if(random === 10){
      console.log("Spawning a duck...");
      quack(client, room);
    }

  }, parseInt(config.dh.interval_between_spawns*1000));
}

function quack(client, room) {
  // Generate random message
  const message = strings.duck.incoming[Math.floor(Math.random() * strings.duck.incoming.length)];
  // Send the message
  client.sendEvent(room, "m.room.message", {
    "body": `🦆 ${message}`,
    "msgtype": "m.text"
  });
  // Duck spawns
  table.add("ducks", 1);
  ducks++;

  // Duck leaves
  setTimeout(() => {
    // Generate random message
    const message = strings.duck.leaving[Math.floor(Math.random() * strings.duck.leaving.length)];
    // Send the message
    client.sendEvent(room, "m.room.message", {
      "body": `${message} ·°'\`'​°-.,.·°'\``,
      "msgtype": "m.text"
    });
    console.log("Removing a duck...");
    table.sub("ducks", 1);
  }, config.dh.timeout*1000);
}

module.exports = { quack, start }