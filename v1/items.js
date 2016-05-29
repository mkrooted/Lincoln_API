var lib = require("./lib.js");
var util = require("util");

function getAll(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            conn.end();
            return;
        }
        conn.query("SELECT * FROM `items`", function (err, rows, fields) {
            if (err) {
                console.error("Error connecing to database: " + err.stack);
                res.statusCode = 500;
                res.json({"error": 500, "desc": err.stack});
                conn.end();
                return;
            }
            if (util.isNullOrUndefined(rows[0])) {
                res.sendStatus(209);
                conn.end();
                return;
            }
            res.statusCode = 200;
            res.type("application/json");
            var r = "[";
            rows.forEach(function (i) {
                r += "{\"id\":" + i.item_id + ", \"name\": \"" + i.item_name + "\", " +
                    "\"starred\": " + i.item_starred + ", \"skin\": \"" + i.item_skin + "\", " +
                    "\"market_price\": " + i.item_market_price + ", " +
                    "\"stattrack\": " + i.item_stattrack + ", " +
                    "\"wear\": \"" + i.item_wear + "\", " +
                    "\"price\": " + i.item_price + ", \"in_stock\": " + i.item_in_stock + "," +
                    "\"available\": " + i.item_available + "},";
            });
            res.send(r.substring(0, r.length - 1) + "]");
            conn.end()
        });
    });
}

function getById(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            conn.end();
            return;
        }
        conn.query("SELECT * FROM `items` WHERE item_id=" + req.params.id, function (err, rows, fields) {
            if (err) {
                console.error("Error connecing to database: " + err.stack);
                res.statusCode = 500;
                res.json({"error": 500, "desc": err.stack});
                conn.end();
                return;
            }
            if (util.isNullOrUndefined(rows[0])) {
                res.sendStatus(404);
                conn.end();
                return;
            }
            res.statusCode = 200;
            res.type("application/json");
            var i = rows[0];
            var r = "{\"id\":" + i.item_id + ", \"name\": \"" + i.item_name + "\", " +
                "\"starred\": " + i.item_starred + ", \"skin\": \"" + i.item_skin + "\", " +
                "\"market_price\": " + i.item_market_price + ", " +
                "\"stattrack\": " + i.item_stattrack + ", " +
                "\"price\": " + i.item_price + ", \"in_stock\": " + i.item_in_stock + "," +
                "\"available\": " + i.item_available + "}";
            res.send(r);
            conn.end()
        });
    });
}

function getTwoRandIds(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            conn.end();
            return;
        }
        conn.query("SELECT COUNT(item_id) as `count` FROM `items`", function (err, rows, fields) {
            if (err) {
                console.error("Error connecing to database: " + err.stack);
                res.statusCode = 500;
                res.json({"error": 500, "desc": err.stack});
                conn.end();
                return;
            }
            if (util.isNullOrUndefined(rows[0])) {
                res.sendStatus(404);
                conn.end();
                return;
            }
            res.statusCode = 200;
            res.type("application/json");

            uniqueId = req.params.id;
            rand1 = rand2 = uniqueId;
            while (rand1 == uniqueId) {
                rand1 = lib.randomInt(1, rows[0].count);
            }
            while (rand2 == rand1 || rand2 == uniqueId) {
                rand2 = lib.randomInt(1, rows[0].count);
            }
            res.json([rand1, rand2]);
            conn.end()
        });
    });
}

module.exports.getAll = getAll;
module.exports.getById = getById;
module.exports.getTwoRandIds = getTwoRandIds;