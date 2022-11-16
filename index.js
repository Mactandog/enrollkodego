const express = require("express");
const app = express();
const port = 9000;
const host = "localhost";
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const cookieParser = require("cookie-parser");

app.set("view engine", "hbs"); // set view engine

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Define Routes
app.use("/", require("./routes/registerRoutes"));
app.use("/auth", require("./routes/auth"));

//Cookie
app.use(cookieParser());

app.listen(port, () => {
  console.log(`Server started at http://${host}:${port}`);
});
