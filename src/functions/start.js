/*
 * functions/start.js
 *
 * Functions that must be run when the bot starts.
 * Includes bullets.
*/

const { QuickDB } = require('quick.db');
const db = new QuickDB();
const table = db.table("Bullets");

const schedule = require('node-schedule');

const config = require("../config.json");

let has_already_started = false;

function run() {
  if(has_already_started === true) return console.log("Start functions already ran!");
  console.log("Running start functions...");
  has_already_started = true;
  // Give all bullets back if we must do so.
  if(config.dh.start.give_all_bullets_back) give_all_bullets_back();
  // We're giving everyone back their bullets every day at 12 AM.
  schedule.scheduleJob("0 0 * * *", function(fireDate){
    console.log(`Started giving bullets back (${fireDate}).`);
    give_all_bullets_back()
  });
}

async function give_all_bullets_back() {
  const d = new Date();
  // Make sure it was yesterday (or any other day)
  const previous = await table.get("last_given_back");
  // Get today's date as ISO 8601 format
  console.log(`Last time giving bullets back was done was on ${previous}.`);
  let month = d.getMonth()+1;
  if(month<10) month = '0' + month;
  let day = d.getDate();
  if(day<10) day = '0' + day;
  const today = `${d.getFullYear()}-${month}-${day}`;
  console.log(`Today is ${today}.`);
  // If today's date is different from the stored one,
  // it's a different day. It may also be null, though.
  if(previous == today){
    const all = await table.all();
    all.map(async k => {
      if(k.id.startsWith("bullets_")){
        // Everyone starts at the provided value.
        await table.set(k.id, config.dh.default_bullets);
      }
    })
    console.log("Gave bullets back!");
  }
  // Then we store the new ISO 8601 date
  await table.set("last_given_back", today);
}

module.exports = { run };
