const express = require("express");
const { firebaseAdminApp } = require("../utils/firebase");
const router = express.Router();
const firestore = firebaseAdminApp.firestore();
router.get("/", (req, res) => {
  return res.send({ response: "I am alive" }).status(200);
});

//each item will have the following properties:
//id
//name
//quantity
//price
//changes - a list of changes including {date, quantity, price}

//view all inventory
router.get("/view", (req, res) => {
  firestore
    .collection("inventory")
    .get()
    .then((snapshot) => {
      let inventory = [];
      snapshot.forEach((doc) => {
        inventory.push({
          ...doc.data(),
        });
      });
      console.log(inventory);
      return res.json(inventory).status(200);
    })
    .catch((err) => {
      console.log(err);
      return res.send(err).status(500);
    });
});

//add item in the inventory
router.post("/create", (req, res) => {
  const { id, name, quantity, price } = req.body;
  //checks to make sure no empty values, and all values are appropriate
  if (
    !id ||
    !name ||
    !quantity ||
    !price ||
    !Number.isInteger(quantity) ||
    !Number.isInteger(price)
  ) {
    return res
      .send(
        "Invalid input, make sure all values exist and are of the proper type."
      )
      .status(400);
  }

  if (quantity < 0 || price < 0) {
    return res.send("Invalid input, a number is less than 0").status(400);
  }

  docRef = firestore.collection("inventory").doc(id);

  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.send("Item already exists").status(400);
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });

  docRef
    .set({
      id,
      name,
      quantity,
      price,
      changes: [{ date: new Date(), quantity, price }],
    })
    .then(() => {
      return res.send({ response: "Item added" }).status(200);
    })
    .catch((err) => {
      console.log(err);
      return res.send(err).status(500);
    });
});

//update item in the inventory
router.put("/update", (req, res) => {
  const { id, name, quantity, price } = req.body;
  //checks to make sure no empty values, and all values are appropriate
  if (
    !id ||
    !name ||
    !quantity ||
    !price ||
    !Number.isInteger(quantity) ||
    !Number.isInteger(price)
  ) {
    return res
      .send(
        "Invalid input, make sure all values exist and are of the proper type."
      )
      .status(400);
  }

  if (quantity < 0 || price < 0) {
    return res.send("Invalid input, a number is less than 0").status(400);
  }

  //make sure item exists
  docRef = firestore.collection("inventory").doc(id);
  docRef
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.send("Item does not exist").status(400);
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });

  docRef
    .update({
      name,
      quantity,
      price,
      changes: firestore.FieldValue.arrayUnion({
        date: new Date(),
        quantity,
        price,
      }),
    })
    .then(() => {
      return res.send({ response: "Item updated" }).status(200);
    })
    .catch((err) => {
      console.log(err);
      return res.send(err).status(500);
    });
});

//delete an item or delete items in bulk from the inventory
router.delete("/delete", (req, res) => {
  const { ids } = req.body;

  ids.forEach((id) => {
    //make sure id exists
    if (!id) {
      return res
        .send(
          "Invalid input, make sure all values exist and are of the proper type."
        )
        .status(400);
    }
    //make sure item exists
    docRef = firestore.collection("inventory").doc(id);
    docRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.send("Item does not exist").status(400);
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });

    //delete document
    docRef
      .delete()
      .then(() => {
        return res.send({ response: "Item deleted" }).status(200);
      })
      .catch((err) => {
        console.log(err);
        return res.send(err).status(500);
      });
  });
});

module.exports = router;
