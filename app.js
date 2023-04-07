const express = require("express");
const cors = require("cors");
const db = require("./app/models");

const app = express();
//Set the URL allowed
var corsOptions = {
  origin:"localhost"
};

app.use(cors(corsOptions));

//Parse requests of content-type - application/json
app.use(express.json());

//Parse requests of content-type - application/x-ww-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//For prod ?? (temp)
/*db.sequelize.sync().then(() => {
  console.log("db connection success")
}).catch((err) => {
  console.log(err.message)
});*/

//For dev
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and re-sync db.");
});

//Test route
app.get("/", (req, res) => {
  res.json({ message: " Server Test OK"});
});

module.exports = app;