const sdk = require("matrix-js-sdk");

module.exports = {
  name: "test",
  async run(client, message, room, user) {
    console.log(message);
    client.sendEvent(room, "m.room.message", {
      "body": `room ${room}`,
      "msgtype": "m.text"
    });
  }
}
