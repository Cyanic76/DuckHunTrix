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

// Has the ducks already started spawning?
let ducks_spawning = false;

function start(client) {
  // room => ID of the specified room
  if(ducks_spawning === true) return console.log("Already started spawning ducks.");
  if(!ducks_spawning) ducks_spawning = true;
  spawn("!tbNFZiSqysFtpzYsta:matrix.org", client);
  console.log("Started spawning ducks!");
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
    if(random == 0){
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
    console.log(`A duck has been waiting for over ${config.dh.duck_timeout} min. Removing...`);
    table.sub("ducks", 1);
  }, config.dh.duck_timeout*1000);
}

module.exports = { quack, start }