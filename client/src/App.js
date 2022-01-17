import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Input from "@material-ui/core/Input";
import { DataGrid } from "@material-ui/data-grid";
import socketIOClient from "socket.io-client";
import { Routes, Link, Route, useParams, useNavigate } from "react-router-dom";
import download from "downloadjs";

const ENDPOINT = "http://127.0.0.1:4001";
const socket = socketIOClient(ENDPOINT, { transports: ["websocket"] });

const columns = [
  {
    field: "id",
    headerName: "ID",
    width: 200,
    description:
      "This column has the unique ID of the item, and hence is not editable.",
    editable: false,
  },
  { field: "name", headerName: "Name", width: 200, editable: true },
  {
    field: "quantity",
    headerName: "Quantity",
    type: "number",
    width: 200,
    editable: true,
  },
  {
    field: "price",
    headerName: "Price",
    type: "number",
    width: 200,
    editable: true,
  },
];

function App() {
  const [response, setResponse] = useState("");
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const params = useParams();
  const navigate = useNavigate();
  //fetch request calling the /view endpoint and setting it equal to rows
  useEffect(() => {
    fetch("/view")
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setRows(response);
      });
  }, [response]);

  //post request calling the /create endpoint
  const CreateItem = () => {
    const id = document.getElementById("id").value;
    const name = document.getElementById("name").value;
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;
    const data = { id, name, quantity, price };

    fetch("/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
      });
  };

  //post request calling the /update endpoint
  const UpdateItem = (data) => {
    fetch("/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
      });
  };

  //post request calling the /delete endpoint
  const DeleteItems = () => {
    const data = { ids: selectedRows };
    fetch("/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
      });
  };

  //get request calling the /generateReport endpoint
  const GenerateReport = async () => {
    const res = await fetch("/generateReport");
    const blob = await res.blob();
    download(blob, "report.pdf");
  };

  useEffect(() => {
    socket.on("FromAPI", (data) => {
      setResponse(data);
    });
  }, []);

  const onCellValueChange = (value) => {
    // Get the row
    const rowIndex = rows.findIndex((row) => row.id === value.id);

    if (rowIndex >= 0) {
      const row = rows[rowIndex];

      // Validate if changed
      if (value.field in row && row[value.field] !== value.value) {
        const data = {
          id: row.id,
          name: row.name,
          quantity: row.quantity,
          price: row.price,
          [value.field]: value.value,
        };
        UpdateItem(data);
      }
    }
  };

  return (
    <div>
      {" "}
      <div>
        <p>
          Hi, welcome to my Shopify Developer Intern Challenge. To edit, double
          click any cell, and confirm your edits by hitting enter. In a real use
          case, you shouldn't be able to edit the ID, so I left that uneditable.
        </p>
      </div>
      <div>
        <form
          style={{
            //80% width and height of whole screen with auto margins
            width: "90%",
            margin: "auto",
          }}
        >
          <Input id="id" label="ID" type="text" placeholder="ID"></Input>
          <Input id="name" label="Name" type="text" placeholder="Name"></Input>
          <Input
            id="quantity"
            label="Quantity"
            type="number"
            placeholder="Quantity"
          ></Input>
          <Input
            id="price"
            label="Price"
            type="number"
            placeholder="Price"
          ></Input>
          <Button
            variant="contained"
            onClick={CreateItem}
            style={{ margin: "10px" }}
          >
            Create Item
          </Button>
          <Button variant="contained" color="primary" onClick={DeleteItems}>
            Delete Selected Items
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={GenerateReport}
          >
            Generate Monthly Report
          </Button>
        </form>
      </div>
      {rows ? (
        <div
          style={{
            //80% width and height of whole screen with auto margins
            width: "90%",
            height: "80vh",
            margin: "auto",
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            disableSelectionOnClick
            onSelectionModelChange={(ids) => {
              setSelectedRows(ids);
              console.log(selectedRows);
            }}
            onCellEditCommit={onCellValueChange}
          />
        </div>
      ) : (
        <h1>Looks like there are no inventory items as of now.</h1>
      )}
    </div>
  );
}

export default App;
