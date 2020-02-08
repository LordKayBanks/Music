const { app } = require("electron");
const sqlite3 = require("sqlite3");
const path = require("path");

// This file contains all database related functions and interactions

const db_path = path.join(app.getPath("userData"), "song_info.db");
const db = new sqlite3.Database(db_path);

// Initialises the songdata table
const init = () =>
  db.run(`CREATE TABLE IF NOT EXISTS songdata (
    fileName TEXT, title TEXT, thumbnail TEXT, artist TEXT, length INT
  )`);

// Songs which are downloaded are added to the db for additional information
const addSong = async ({ title, thumbnail, artist, length }) =>
  db.run(
    `INSERT INTO songdata
    (title, thumbnail, artist, length) VALUES
    ('${title}', '${thumbnail}', '${artist}', ${length})
  `,
    [],
    (err, val) => console.error(err)
  );

// the search queries the database for all songs whose titles contains the search query
const search = async songTitle =>
  new Promise(async (res, rej) =>
    db.all(
      `SELECT * FROM songdata WHERE title LIKE '%${songTitle}%'`,
      [],
      (err, data) => res(data)
    )
  );

// Gives all songs in the songdata database
const all = () =>
  new Promise((res, rej) =>
    db.all(`SELECT * FROM songdata`, [], (err, data) => {
      if (err) console.error(err);
      res(data);
    })
  );

const clear = () => db.all("DELETE FROM songdata");

const close = () => db.close();

const print = () =>
  db.all(`SELECT * FROM songdata`, [], (err, val) => {
    if (err) console.error(err);
    console.log("SONG DB:\n", val);
  });

module.exports = {
  init,
  addSong,
  search,
  all,
  clear,
  close,
  print
};