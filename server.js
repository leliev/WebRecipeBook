require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

var corsOptions = {
    origin:"localhost"
};

app.use(cors(corsOptions));

//Parse requests of content-type - application/json
app.use(bodyParser.json());

//Parse requests of content-type - application/x-ww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
/*db.sequelize.sync*/

//For dev
db.sequelize.sync({ force: true }).then(() => {
    console.log("Drop and re-sync db.");
  });

//Test route
app.get("/", (req, res) => {
    res.json({ message: " Server Test OK"});
});

//set port, listen for requests
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});