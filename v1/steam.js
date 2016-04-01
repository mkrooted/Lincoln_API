var market = require("csgo-market");
var lib = require("./lib.js");
var util = require("util");
var range = require("underscore").range;

var DETECTION_MODE;

function initialize(mode) {
    if (typeof mode == "undefined" || mode < 0 || mode > 2) {
        DETECTION_MODE = lib.DetectionModes["normal"];
        return
    }
    DETECTION_MODE = mode;
}

function LobanovKoreshkovChecker(marketPrice, marketQty, recentOps, couponPrice, activeCoupons, itemId) {
    if (marketPrice / couponPrice <= 1.075 || activeCoupons * 4 >= marketQty) {
        lib.getConnection(function (arr, conn) {
            if (arr)return;
            conn.query("select `item_id`, `item_price` from `items`", function (err, rows, fields) {
                if (err)return;
                var closest = 0;
                var choise;
                for (var i in rows) {
                    if (i["item_id"] != itemId && i["item_price"] / couponPrice > closest && i["item_price"] / couponPrice <= 1)choise = i["item_id"];
                }
                conn.query("update `coupons` set `coupon_item`=" + choise + " where `coupon_item`=" + itemId, function (err, r, f) {

                });

            });
        });
    }
}

function checkPrice(itemId) {
    lib.getConnection(function (arr, conn) {
        if (arr) {
            return
        }
        conn.query("SELECT item_type FROM `items` WHERE item_id = " + itemId, function (err, rows, fields) {
            if (err) {
                return
            }
            if (isNullOrUndefined(rows[0])) {
                return
            }
        });
    });
}

function checkItemQuantity(item_id) {
    if (typeof item_id == "undefined") return;
    lib.getConnection(function (err, conn) {
        if (err)return;
        conn.query("SELECT COUNT(item_id), item_price, item_type, item_name from `items` where item_id = " + item_id, function (arr, rows, fields) {
            if (arr)return;
            var matches = rows[0];
            var price = rows[1];
            var item_type = rows[2];
            var name = rows[3];
            if (matches === 1) {
                switch (item_type) {
                    case 0:
                        market.getSingleKnifePrice()
                }
            }
        });
    });
}