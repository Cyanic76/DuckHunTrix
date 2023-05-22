const sdk         = require("matrix-js-sdk");
const fetch       = require("cross-fetch");
const t           = require("./tokens.json");
const config      = require("./config.json");
const DuckSpawner = require("./functions/spawn");
const Start       = require("./functions/start");

global.fetch

let started = 0;

console.log(`Hi! This is DuckHunt for Matrix!`);

const client = sdk.createClient({
  baseUrl: "https://matrix-client.matrix.org",
  accessToken: t.token,
  userId: t.uid,
});

client.startClient();

client.once('sync', function(state, prevState, res) {
  // Let's set the start timestamp now so we
  // can ignore previously played events.
  if(state === "PREPARED"){
    started = Date.now();
    console.log(`[MAIN] Started at ${started} (${new Date(started)})`);
    // Get all rooms & start spawning the ducks
    const rooms = client.getRooms();
    DuckSpawner.start(client, rooms);
  }
  console.log(`[MAIN] Got ${state}!`);
});

client.on("Room.timeline", function(event, room) {
  // Only look for *new* messages
  if (event.getType() !== "m.room.message") return;
  Start.run();
  // Wait before the bot has started
  if(started === 0) return;
  // Ignore previous messages & messages sent by bot
  if (event.localTimestamp < started || event.event.origin_server_ts < started) return;
  if (event.event.sender == client.credentials.userId) return;
  // Get message, Room #, User #, command
  const message = event.event.content.body;
  const roomId = event.sender.roomId;
  // User ID must follow the "[userid]_[host]" template as well.
  const displayname = event.sender.userId
  const user = displayname.replace("@", "").replace(":", "_");
  const cmdname = message.split(" ")[0];
  // Ignore messages without prefix
  if(!cmdname.startsWith(config.prefix)) return;
  try {
    // Try to load the command file
    const cmd = require(`./commands/${cmdname.replace(config.prefix, "")}`);
    // Run it with the vars
    cmd.run(client, message, roomId, user, displayname);
  } catch(e) {
    if(e){
      // If it is not a command, DO NOT LOG errors.
      if(e.code === 'MODULE_NOT_FOUND') return;
      // Else, log them.
      return console.log(e);
    }
  }
});
