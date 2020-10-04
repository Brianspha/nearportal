require("dotenv").config({});
const helpers = require('../helpers/')
const uuid = require('randomstring')
const log = console.log;
const port = process.env.PORT
const morgan = require('morgan')
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const net = require('net')
let http = require('http')
var server = http.createServer(app);

app.use(bodyParser.json())
app.use(morgan("combined"))
app.use(bodyParser.urlencoded({ // Middleware
    extended: true
}));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/api/v1/upload/',helpers.addFile);
console.log(`nearportal-server running on port: ${port}`)
console.log("----------------------------------------------------");
server.listen(port)
module.exports= app;