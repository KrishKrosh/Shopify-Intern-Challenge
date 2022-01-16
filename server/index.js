const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 3001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

const getApiAndEmit = "TODO";
