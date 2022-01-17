const express = require("express");
const admin = require("firebase-admin");
const { firebaseAdminApp } = require("../utils/firebase");
const router = express.Router();
const firestore = firebaseAdminApp.firestore();
router.get("/", (req, res) => {
  return res.send({ response: "I am alive" }).status(200);
});
const { handleData } = require("../helpers/reportData");

//NOTE: REPORT GENERATION ROUTE IS AT THE BOTTOM OF THIS FILE
//each item will have the following properties:
//id
//name
//quantity
//price
//changes - a list of changes including {date, quantity, price}

//view all inventory
router.get("/view", (req, res) => {
  console.log("viewing inventory");
  firestore
    .collection("inventory")
    .get()
    .then((snapshot) => {
      let inventory = [];
      snapshot.forEach((doc) => {
        inventory.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      console.log(inventory);
      return res.json(inventory);
    })
    .catch((err) => {
      console.log(err);
      return res.send({ error: err }).status(500);
    });
});

//add item in the inventory
router.post("/create", (req, res) => {
  console.log(req.body);
  const { id, name, quantity, price } = req.body;
  //checks to make sure no empty values, and all values are appropriate
  if (
    !id ||
    !name ||
    !quantity ||
    !price ||
    !Number.isInteger(parseInt(quantity)) ||
    !Number.isInteger(parseInt(price))
  ) {
    return res
      .status(400)
      .send({ error: "Please enter a valid id, name, quantity, and price" });
  }

  if (quantity < 0 || price < 0) {
    return res
      .send({ error: "Invalid input, a number is less than 0" })
      .status(400);
  }

  docRef = firestore.collection("inventory").doc("" + id);

  docRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log("exists");
        return res.send({ error: "Item already exists" }).status(400);
      } else {
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
            return res.send({ error: err }).status(500);
          });
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });
});

//update item in the inventory
router.put("/update", (req, res) => {
  const { id, name, quantity, price } = req.body;
  console.log(req.body);
  console.log("updating item");
  //checks to make sure no empty values, and all values are appropriate
  if (
    !id ||
    !name ||
    !quantity ||
    !price ||
    !Number.isInteger(parseInt(quantity)) ||
    !Number.isInteger(parseInt(price))
  ) {
    return res
      .send({
        error:
          "Invalid input, make sure all values exist and are of the proper type.",
      })
      .status(400);
  } else if (quantity < 0 || price < 0) {
    return res
      .send({ error: "Invalid input, a number is less than 0" })
      .status(400);
  } else {
    //make sure item exists
    docRef = firestore.collection("inventory").doc("" + id);
    docRef
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.send({ error: "Item does not exist" }).status(400);
        } else {
          docRef
            .update({
              name,
              quantity,
              price,

              changes: admin.firestore.FieldValue.arrayUnion({
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
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
});

//delete an item or delete items in bulk from the inventory
router.delete("/delete", (req, res) => {
  const { ids } = req.body;
  console.log(req.body);
  console.log(ids);

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
    docRef = firestore.collection("inventory").doc("" + id);
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
    docRef.delete().catch((err) => {
      console.log(err);
      return res.send(err).status(500);
    });
  });
  return res.send({ response: "Items deleted" }).status(200);
});

//a report generation route that finds the item with the highest quantity, lowest quantity with their names
//it also creates a list of all changes that have occured for each item and puts it into one big list
//it also finds the total number of items in the inventory and the total number of changes that have occured
router.get("/generateReport", (req, res) => {
  console.log("generating report");
  firestore
    .collection("inventory")
    .get()
    .then((snapshot) => {
      let inventory = [];
      snapshot.forEach((doc) => {
        inventory.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      console.log(inventory);
      handleData(inventory);
      return res.download("report.pdf");
    })
    .catch((err) => {
      console.log(err);
      return res.send({ error: err }).status(500);
    });
});

module.exports = router;
