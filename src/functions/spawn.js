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
table.all(async k => {
  if(k.id.startsWith("ducks_")) await table.set(k.id, 0);
  if(k.id.startsWith("duckOrder_")) await table.set(k.id, []);
})

// Has the ducks already started spawning?
let ducks_spawning = false;
let ducks = 0; // TODO: Remove this

async function start(client, all_rooms) {
  // If ducks have already started spawning, ignore other calls.
  if(ducks_spawning === true) return;
  if(!ducks_spawning) ducks_spawning = true;
  //spawn(tokens.room, client);
  //console.log("Started spawning ducks!");
  console.log(`[SPAWN] I'm in ${all_rooms.length} rooms.`);
  all_rooms.forEach(r => {
    // Ignore blacklisted rules (see tokens.json)
    if(tokens.blacklisted_rooms.includes(r.roomId)) return;
    // If room isn't blacklisted, start duck spawning
    spawn(r.roomId, client);
    console.log(`[SPAWN] Started spawning ducks in ${r.roomId}`);
  })
}

function spawn(room, client) {
  let random = -1;

  // Generate "random" numbers
  setInterval(() => {
    random = get_random_number();
    if(config.log.show_random_spawn == true) console.log(`[SPAWN] Got ${random} in room ${room}`);

    // If we get lucky, then we spawn a duck
    if(random == 0){
      console.log("[SPAWN] Spawning a duck...");
      quack(client, room);
    }

  }, parseInt(config.dh.interval_between_spawns*1000));
}

async function quack(client, room) {
  // Are there already enough ducks?
  if(ducks >= config.dh.max_ducks_in_room){
    console.log("[SPAWN] We already have enough ducks (" + config.dh.max_ducks_in_room + ") in this room.");
    return;
  }
  // Generate random message
  const message = strings.duck.incoming[Math.floor(Math.random() * strings.duck.incoming.length)];
  // Send the message
  client.sendEvent(room, "m.room.message", {
    "body": `🦆 ${message}`,
    "msgtype": "m.text"
  }).catch(e => {
    if(e) console.log(`[SPAWN] ${e.errcode} happened in room ${room}.`);
  });
  // Duck spawns / need to get correct room format
  const database_room = room.replace("!", "").replace(":", "_").replace(".", "_");
  table.add(`ducks_${database_room}`, 1);
  // Remember order
  let current = await table.get(`duckOrder_${database_room}`);
  if(current == null){
    current = ["default"];
  } else current.push("default");
  await table.set(`duckOrder_${database_room}`, current);
  ducks++;
  // Duck leaves
  setTimeout(async () => {
    // Generate random message
    const message = strings.duck.leaving[Math.floor(Math.random() * strings.duck.leaving.length)];
    // Send the message
    client.sendEvent(room, "m.room.message", {
      "body": `${message} ·°'\`'​°-.,.·°'\``,
      "msgtype": "m.text"
    });
    console.log(`[SPAWN] A duck has been waiting for over ${config.dh.duck_timeout} min. Removing...`);
    table.sub(`ducks_${database_room}`, 1);
    // Remove the first duck from array
    let current = await table.get(`duckOrder_${database_room}`);
    current.shift();
    await table.set(`duckOrder_${database_room}`, current);
    ducks--;
  }, config.dh.duck_timeout*1000);
}

function get_random_number() { return Math.floor(Math.random() * (10 - 0 + 1)); }

module.exports = { quack, start }