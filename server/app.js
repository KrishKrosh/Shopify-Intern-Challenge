//to set up the server
const express = require("express");
const http = require("http");
const app = express();
const inventoryRoutes = require("./routes/inventoryRoutes");
app.use(inventoryRoutes);
const server = http.createServer(app);
const port = process.env.PORT || 4001;

//to set up socket io websocket for realtime updates
const { socketConnection } = require("./utils/socket-io");
socketConnection(server);
const { inventoryUpdated } = require("./utils/socket-io");

//to set up firebase
const { firebaseAdminApp } = require("../utils/firebase");
const firestore = firebaseAdminApp.firestore();

//calls socket.io to emit when the inventory has been updated
firestore.collection("inventory").onSnapshot((snapshot) => {
  inventoryUpdated();
});

server.listen(port, () => console.log(`Listening on port ${port}`));
