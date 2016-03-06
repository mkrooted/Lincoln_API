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
                r += "{\"id\":" + i.item_id + ", \"name\": '" + i.item_name + "', " +
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
            var r = "{\"id\":" + i.item_id + ", \"name\": '" + i.item_name + "', " +
                "\"price\": " + i.item_price + ", \"in_stock\": " + i.item_in_stock + "," +
                "\"available\": " + i.item_available + "}";
            res.send(r);
            conn.end()
        });
    });
}

module.exports.getAll = getAll;
module.exports.getById = getById;