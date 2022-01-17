let io;
let interval;

exports.socketConnection = (server) => {
  io = require("socket.io")(server);
  io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    socket.join(socket.request._query.id);
    socket.on("disconnect", () => {
      console.info(`Client disconnected [id=${socket.id}]`);
    });
  });
};

//will simply send the current time to signal that the inventory has been updated.
exports.inventoryUpdated = () => {
  const response = new Date();
  io.emit("FromAPI", response);
  // console.log("inventory updated");
};
