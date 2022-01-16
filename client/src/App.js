import React, { useState, useEffect } from "react";

import { DataGrid } from "@material-ui/data-grid";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:4001";
const socket = socketIOClient(ENDPOINT, { transports: ["websocket"] });

const columns = [
  { field: "id", headerName: "ID", width: 200 },
  { field: "firstName", headerName: "First name", width: 200 },
  { field: "lastName", headerName: "Last name", width: 200 },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 200,
  },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (params) =>
      `${params.getValue(params.id, "firstName") || ""} ${
        params.getValue(params.id, "lastName") || ""
      }`,
  },
];

const rows = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
];

function DataTable() {
  return (
    <div
      style={{
        //80% width and height of whole screen with auto margins
        width: "90%",
        height: "80vh",
        margin: "auto",
      }}
    >
      <DataGrid rows={rows} columns={columns} checkboxSelection />
    </div>
  );
}

function App() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    socket.on("FromAPI", (data) => {
      setResponse(data);
    });
  }, []);

  return (
    <div>
      {" "}
      <p>
        It's <time dateTime={response}>{response}</time>
      </p>
      {DataTable()}
    </div>
  );
}

export default App;