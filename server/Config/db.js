require("dotenv").config();
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

const mongoURI = process.env.URL;

const conn = mongoose.createConnection(mongoURI);

let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
    console.log("MongoDB & GridFS connected successfully!");
});

module.exports = { conn, gfs };
