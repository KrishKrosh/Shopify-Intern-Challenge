const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

server.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = router;
