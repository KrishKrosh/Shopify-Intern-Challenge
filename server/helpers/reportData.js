const pdfGenerator = require("pdfkit");
const fs = require("fs");

exports.handleData = (inventory) => {
  //finding the quantity changed of each item in the past 30 days
  let quantitiesChanged = [];

  let highestQuantityChanged = Number.MIN_SAFE_INTEGER;
  let lowestQuantityChanged = Number.MAX_SAFE_INTEGER;
  let highestQuantityChangedName = "";
  let lowestQuantityChangedName = "";
  let highestQuantity = 0;
  let lowestQuantity = 0;
  let highestQuantityName = "";
  let lowestQuantityName = "";
  let totalItems = 0;
  let totalChanges = 0;
  inventory.forEach((item) => {
    //finding the quantity changed of each item in the past 30 days
    item.changes.some((change) => {
      if (
        change.date.toDate() > new Date().setDate(new Date().getDate() - 30)
      ) {
        let quantityChanged = item.quantity - change.quantity;
        quantitiesChanged.push({
          name: item.name,
          quantity: quantityChanged,
        });

        //finding the highest and lowest quantity changed of each item in the past 30 days
        if (quantityChanged > highestQuantityChanged) {
          highestQuantityChanged = quantityChanged;
          highestQuantityChangedName = item.name;
        }
        if (quantityChanged < lowestQuantityChanged) {
          lowestQuantityChanged = quantityChanged;
          lowestQuantityChangedName = item.name;
        }

        return (
          change.date.toDate() > new Date().setDate(new Date().getDate() - 30)
        );
      }
    });

    //finding the highest and lowest quantity of each item in the past 30 days
    if (item.quantity > highestQuantity) {
      highestQuantity = item.quantity;
      highestQuantityName = item.name;
    }
    if (item.quantity < lowestQuantity || lowestQuantity === 0) {
      lowestQuantity = item.quantity;
      lowestQuantityName = item.name;
    }

    //finding the total number of items in the inventory
    totalItems += item.quantity;
    //finding the total number of changes that have occured
    totalChanges += item.changes.length;
  });

  //creating a pdf file with the following information: highest quantity, lowest quantity, highest quantity changed, lowest quantity changed, total items, total changes
  //and a list of all quantity changes for each item
  const doc = new pdfGenerator();
  doc.pipe(fs.createWriteStream("report.pdf"));
  doc.fontSize(25).text("Monthly Inventory Report");
  doc.moveDown();
  doc
    .fontSize(20)
    .text("Highest Quantity: " + highestQuantityName + " " + highestQuantity);
  doc.moveDown();
  doc
    .fontSize(20)
    .text("Lowest Quantity: " + lowestQuantityName + " " + lowestQuantity);
  doc.moveDown();
  doc
    .fontSize(20)
    .text(
      "Highest Quantity Changed: " +
        highestQuantityChangedName +
        " " +
        highestQuantityChanged
    );
  doc.moveDown();
  doc
    .fontSize(20)
    .text(
      "Lowest Quantity Changed: " +
        lowestQuantityChangedName +
        " " +
        lowestQuantityChanged
    );
  doc.moveDown();
  doc.fontSize(20).text("Total Items: " + totalItems);
  doc.moveDown();
  doc.fontSize(20).text("Total Changes: " + totalChanges);
  doc.moveDown();
  doc.fontSize(20).text("Quantity Changes:");
  doc.moveDown();
  doc.fontSize(15).text("Name: Quantity");
  doc.moveDown();
  doc.fontSize(15).text("------------------------------------");
  doc.moveDown();
  quantitiesChanged.forEach((item) => {
    doc.fontSize(15).text(item.name + ": " + item.quantity);
    doc.moveDown();
  });
  doc.end();
  return doc;
};
