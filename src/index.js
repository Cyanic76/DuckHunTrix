const sdk         = require("matrix-js-sdk");
const fetch       = require("cross-fetch");
const t           = require("./tokens.json");
const config      = require("./config.json");
const DuckSpawner = require("./functions/spawn");

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
    console.log(client.credentials.userId);
    started = Date.now();
    console.log(`Started at ${started} (${new Date(started)})`);
  }
  console.log(`Got ${state}!`);
});

// That is a handler.
client.on("Room.timeline", function(event, room, toStartOfTimeline) {
  // Only look for messages
  if (event.getType() !== "m.room.message") return;
  // Start spawning the ducks
  DuckSpawner.start(client);
  // Ignore previous messages
  if (event.localTimestamp < started || event.origin_server_ts < started) return;
  // Ignore messages sent by the bot
  if (event.event.sender == client.credentials.userId) return;

  // Get message, Room #, User #, command
  const message = event.event.content.body;
  const roomId = event.sender.roomId;
  const user = event.sender.userId;
  const cmdname = message.split(" ")[0];
  // Ignore messages without prefix
  if(!cmdname.startsWith(config.prefix)) return;
  try {
    // Try to load the command file
    const cmd = require(`./commands/${cmdname.replace(config.prefix, "")}`);
    // Run it with the vars
    cmd.run(client, message, roomId, user);
  } catch(e) {
    // Error
    if(e) return console.log(e);
  }
});
