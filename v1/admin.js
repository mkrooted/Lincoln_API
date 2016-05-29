var lib = require("./lib.js");
var util = require("util");
var market = require("./steam-market-csgo/main.js");

//misc functions
function td(content) {
    return "<td>" + content + "</td>";
}
function tr(content) {
    return "<tr>" + content + "</tr>";
}
function getNewPrices() {
    lib.getConnection(function (err, conn) {
        conn.query("SELECT item_name, item_skin, item_starred, item_stattrack, item_wear FROM `items`", function (error, rows, fields) {
            if (error || typeof rows[0] == "undefined") {
                conn.end();
                return;
            }
            rows.forEach(function (item) {
                market.getPrice(market.currency.usd, item.item_starred, item.item_stattrack, item.item_name,
                    item.item_skin, item.item_wear);
            });
        });
        conn.end();
    });
}
market.priceProvider.on('newPrice', function (args) {
    lib.getConnection(function (err, conn) {
        if (err) {
            conn.end();
            return;
        }
        conn.query("SELECT item_id, item_price FROM `items` WHERE item_name='" + args.name + "' && item_skin='" + args.skin +
            "' && item_wear='" + args.wear + "'", function (error, rows, fields) {
            if (error || typeof rows[0] == "undefined") {
                conn.end();
                return;
            }
            conn.query("UPDATE `items` SET item_market_price = " + args.price + " WHERE item_id = " + rows[0].item_id + ";\n" +
                "INSERT INTO `price_records` (price_record_item, price_record_price) VALUES " +
                "(" + rows[0].item_id + ", " + args.price + ");", function (err, rows, fields) {
                //if (err)return;
                conn.end();
            });
        });
    });
});

//table -> tr -> td
function table(head, rows) {
    if (typeof head !== "object" || typeof rows !== "object") return;
    var result_html =
        "<style>\n" +
        "table, tr, td {\nborder-collapse: collapse; \nborder: solid black 1px; \npadding: 5px;\n}\n" +
        "</style>\n<table>\n";
    var head_content_html = "";
    head.forEach(function (head_cell) {
        head_content_html += td(head_cell);
    });
    result_html += tr(head_content_html);

    rows.forEach(function (row) {
        var row_html = "";
        row.forEach(function (row_cell) {
            row_html += td(row_cell);
        });
        result_html += tr(row_html) + "\n";
    });
    result_html += "</table>";
    return result_html;
}

//Web pages
function getPriceTable(req, res) {
    getNewPrices();
    lib.getConnection(function (error, connection) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack()});
            connection.end();
            return;
        }
        connection.query("SELECT * FROM `items`", function (err, rows, fields) {
            var table_head = [], table_rows = [];
            fields.forEach(function (field) {
                table_head.push(field.name);
            });
            rows.forEach(function (row) {
                table_rows.push(lib.objectValues(row));
            });
            res.send(table(table_head, table_rows));
            connection.end();
        });
    });
}
function getPriceTrends(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            conn.end();
            return;
        }
        conn.query("SELECT * FROM price_records WHERE price_record_item = " + req.params.id, function (err, rows, fields) {
            if (err) {
                res.statusCode = 500;
                res.json({"error": 500, "desc": err.stack});
                conn.end();
                return;
            }
            if (typeof rows == "undefined" || typeof rows[0] == "undefined") {
                res.sendStatus(404);
                conn.end();
                return;
            }

            var r = [['Datetime', 'market price', 'coupon price']];
            rows.forEach(function (row) {
                r.push([
                    row.price_record_datetime.toString().substring(4, 24),
                    row.price_record_price
                ]);
            });

            res.json(r);
            conn.end();
        });
    });
}

function newNotification(req, res) {
    var data = req.body;
    if (typeof data.type != "number" || typeof data.details != "string") {
        res.statusCode = 400;
        res.json({error: 400, desc: "Invalid input"});
        return;
    }
    lib.getConnection(function (error, conn) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack()});
            conn.end();
            return;
        }
        var sql = "INSERT INTO notifications (notification_type, notification_details" + typeof data.title == "string" ? ", notification_title) " : ") " +
        "VALUES (" + data.type + ", '" + data.details + "'" + typeof data.title == "string" ? ", " + data.title + "')" : ")";
        conn.query(sql, function (err, rows, fields) {
            if (err) {
                if (error) {
                    res.statusCode = 500;
                    res.json({"error": 500, "desc": error.stack()});
                    conn.end();
                    return;
                }
            }
        });
    });
}

module.exports.tableGenerator = table;
module.exports.getPriceTable = getPriceTable;
module.exports.getNewPrices = getNewPrices;
module.exports.getPriceTrends = getPriceTrends;