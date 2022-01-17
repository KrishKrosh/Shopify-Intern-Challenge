let io;
let interval;

exports.socketConnection = (server) => {
  io = require("socket.io")(server);
  io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    socket.join(socket.request._query.id);

    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);

    socket.on("disconnect", () => {
      console.info(`Client disconnected [id=${socket.id}]`);
    });
  });
};

//will simply send the current time to signal that the inventory has been updated.
exports.inventoryUpdated = () => {
  const response = new Date();
  socket.emit("FromAPI", response);
};
