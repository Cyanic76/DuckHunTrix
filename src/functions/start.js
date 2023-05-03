/*
 * functions/start.js
 *
 * Functions that must be run when the bot starts.
*/

const QuickDB = require("quick.db");
const db = new QuickDB();
const table = db.table("Bullets");
const config = require("../config.json");

let has_already_started = false;

function run() {
  if(has_already_started === false) return console.log("Start functions already ran!");
  has_already_started = true;
  give_all_bullets_back();
}

// We're giving everyone back their bullets every day at 12 AM.
async function give_all_bullets_back() {
  const d = new Date();
  // Make sure it was yesterday
  const previous = await table.get("last_given_back");
  // Get today's date as ISO 8601 format because all other
  // formats are pure nonsense.
  console.log(`Last time giving bullets back was done was on ${previous}.`);
  let month = d.getMonth();
  if(month<10) month = '0' + month;
  let day = d.getDate();
  if(day<10) day = '0' + day;
  const today = `${d.getFullYear()}-${month}-${day}`;
  console.log(`Today is ${today}.`);
  // If today's date is different from the stored one,
  // it's a different day. It may also be null, though.
  if(previous != today){
    console.log("Giving bullets back...");
    table.all(value => {
      if(value.ID.startsWith("bullets_")){
        table.set(value.ID, config.dh.default_bullets);
      }
    })
  }
  // Then we store the new ISO 8601 date
  await table.set("last_given_back", today);
}

module.exports = { run };
