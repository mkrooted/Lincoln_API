var util = require("util");
var express = require("express");
var crypto = require("crypto");
var bodyParser = require('body-parser');
var regexp = require("node-regexp");
//var logger = require("./logger.js");
var app = express();
app.locals.title = "Lincoln_API";
app.locals.email = "koreshov.m@gmail.com";
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing POST data

var lib = require("./lib.js");
var users = require("./users.js");
var coupons = require("./coupons.js");
var items = require("./items.js");
var admin = require("./admin.js");
var fs = require("fs");

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
app.get("/items/getRandomIds/:id", items.getTwoRandIds);
app.get("/items/:id", items.getById);

// ADMIN PANEL
app.get("/admin/getPriceTable", admin.getPriceTable);
app.get("/admin/updatePrices", function (req, res) {
    admin.getNewPrices();
    res.sendStatus(200);
});
app.get("/admin/getPriceTrends/:id", admin.getPriceTrends);

// FRONTEND
app.post("/frontend/register", users.new);
app.post("/frontend/orderCoupon", coupons.new);
//app.post("/frontend/paymentSuccessful", );

// ROUTINES AND VARS-CONSTS
var UPDATE_INTERVAL = 5 * 60 * 1000; //in milliseconds
var CONFIG, PORT = 80;

//  STARTING API
fs.readFile("apiconfig.json", function (error, content) {
    if (error) {
        console.error("Error opening config file! API launch aborted.");
        console.error("Error stack: ", error.stack);
        return;
    }
    try {
        CONFIG = JSON.parse(content);
        console.log("Config file parsed");
    } catch (err) {
        console.error("Error parsing config file! API launch aborted.");
        console.error("Error stack: ", err.stack);
        return;
    }
    if (CONFIG.priceUpdateInterval) {
        UPDATE_INTERVAL = CONFIG.priceUpdateInterval;
    }
    if (CONFIG.apiPort) {
        PORT = CONFIG.apiPort;
    }
    if (typeof CONFIG.adminPassword != "string" || CONFIG.adminPassword == "" ||
        typeof CONFIG.frontHost != "string" || CONFIG.frontHost == "" ||
        typeof CONFIG.steamApiKey != "string" || CONFIG.steamApiKey == "" ||
        typeof CONFIG.WMSecret != "string" || CONFIG.WMSecret == "" ||
        typeof CONFIG.dbhost != "string" || CONFIG.dbhost == "" ||
        typeof CONFIG.dbname != "string" || CONFIG.dbname == "" ||
        typeof CONFIG.dbpass != "string" || CONFIG.dbpass == "" ||
        typeof CONFIG.dbport != "number") {
        console.error("Not enough parameters in config file! API launch aborted.");
        return;
    }
    console.log("Starting API...");
    try {
        setInterval(function () {
            admin.getNewPrices()
        }, UPDATE_INTERVAL);
        admin.getNewPrices();
    } catch (arr) {
        console.error("Error planning routines: ", error.stack);
    }

    app.listen(PORT);
    console.log("API STARTED ON PORT", PORT);
});