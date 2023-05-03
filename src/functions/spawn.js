/*
 * functions/spawn.js
 *
 * The Duck Manager.
 * Controls duck spawning in the room and remembers in what order they're spawned.
*/

// DB
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const table = db.table("ducks");

// Other files
const config = require("../config.json");
const tokens = require("../tokens.json");
const strings = require("../functions/strings.json");

// How many ducks in the room?
table.set("ducks", 0);

// Has the ducks already started spawning?
let ducks_spawning = false;

function start(client) {
  // room => ID of the specified room
  if(ducks_spawning === true) return console.log("Already started spawning ducks.");
  if(!ducks_spawning) ducks_spawning = true;
  spawn(tokens.room, client);
  console.log("Started spawning ducks!");
}

function spawn(room, client) {
  let random = -1;

  // Generate "random" numbers
  setInterval(() => {
    random = get_random_number();
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
  // Remember order
  let current = table.get("duckOrder");
  if(current === null){
    current = ["default"];
  } else current.push("default");
  table.set("duckOrder", current);
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
    // Remove the first duck from array
    let current = table.get("duckOrder");
    current.shift();
    table.set("duckOrder", current);
  }, config.dh.duck_timeout*1000);
}

function get_random_number() { return Math.floor(Math.random() * (10 - 0 + 1)); }

module.exports = { quack, start }