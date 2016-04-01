var util = require("util");
var express = require("express");
var crypto = require("crypto");
var bodyParser = require('body-parser');
var regexp = require("node-regexp");
var app = express();
app.locals.title = "Lincoln_API";
app.locals.email = "koreshov.m@gmail.com";
app.use(bodyParser.json()); // for parsing application/json

var lib = require("./lib.js");
var users = require("./users.js");
var coupons = require("./coupons.js");
var items = require("./items.js");
var admin = require("./admin.js");

// USERS SECTION
app.get("/users", users.getAll); //get all records from table 'users'
app.get("/users/:login", users.getByLogin); //get certain user by login
app.post("/users", users.new);
app.patch("/users/:login", users.modify);
app.delete("/users/:login", users.delete);

// COUPONS SECTION
app.get("/coupons", coupons.getAll);
app.get("/coupons/:id", coupons.getById);
app.post("/coupons", coupons.new);
app.delete("/coupons/:id", coupons.delete);
app.get("/coupons/:id/paid", coupons.setPaid);
app.all("/coupons/:id/createChildren", coupons.createChildren);

// ITEMS SECTION
app.get("/items", items.getAll);
app.get("/items/:id", items.getById);

// ADMIN PANEL
app.get("/admin/getPriceTable", admin.getPriceTable);

var port = 2016;
app.listen(port);
console.log("Listening on port " + String(port));