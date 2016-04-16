var market = require("csgo-market");
var lib = require("./lib.js");
var util = require("util");
var range = require("underscore").range;

var DETECTION_MODE;

function initialize(mode) {// mode = "normal", "weak", "hardcore"
    DETECTION_MODE = mode;
}

function LobanovKoreshkovChecker(marketPrice, marketQty, recentOps, couponPrice, activeCoupons, itemId) {
}

function checkPrice(itemId) {
}

function isPriceFalling() {

}
function isPriceRising() {

}
function isPriceJumping() {

}

function checkItemQuantity(item_id) {
}