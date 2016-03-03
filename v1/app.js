var util = require("util");
var express = require("express");
var crypto = require("crypto");
var bodyParser = require('body-parser');
var regexp = require("node-regexp");
var app = express();
app.locals.title = "Lincoln_API";
app.locals.email = "koreshov.m@gmail.com";
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

var lib = require("./lib.js");
var users = require("./users.js");
var coupons = require("./coupons.js");

// USERS SECTION
app.get("/users", users.getAll()); //get all records from table 'users'
app.get("/users/:login", users.getByLogin()); //get certain user by login
app.post("/users", users.new());
app.patch("/users/:login", users.modify());
app.delete("/users/:login", users.delete());

// COUPONS SECTION
app.get("/coupons", coupons.getAll());
app.get("/coupons/:id", coupons.getById());
app.post("/coupons", coupons.new());
app.all("/coupons/:id/paid", function (res, req) {
    coupons.setPaid(res.params.id);
    req.sendStatus(200);
});
app.all("/coupons/:id/createChildren", function (res, req) {
    coupons.createChildren(res.params.id, 3);
    req.sendStatus(200);
});

app.listen(2016);