var lib = require("./lib.js");
var util = require("util");

var CHILDRENAMOUNT = 3;

function modify(req, res) {
    var data = req.body;
    lib.getConnection(function (error, conn) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            conn.end();
            return;
        }
        conn.query("SELECT * FROM `coupons` WHERE coupon_id='" + req.params.id + "'", function (err, rows, fields) {
            if (err) {
                res.statusCode = 500;
                res.json({"error": 500, "desc": error.stack});
                conn.end();
                return;
            }
            if (util.isNullOrUndefined(rows[0])) {
                res.sendStatus(404);
                conn.end();
                return;
            }

            var sql = "";
            if (!util.isNullOrUndefined(data.owner)) {
                sql += "UPDATE `coupons` SET coupon_owner='" + data.owner + "' " +
                    "WHERE coupon_id='" + req.params.id + "'\n";
            }
            if (!util.isNullOrUndefined(data.price)) {
                sql += "UPDATE `coupons` SET coupon_price='" + data.price + "' " +
                    "WHERE coupon_id='" + req.params.id + "'\n";
            }
            if (!util.isNullOrUndefined(data.item)) {
                sql += "UPDATE `coupons` SET coupon_owner='" + data.price + "' " +
                    "WHERE coupon_id='" + req.params.id + "'\n";
            }
            conn.query(sql, function (err) {
                if (err) {
                    res.statusCode = 500;
                    res.json({"error": 500, "desc": error.stack});
                    conn.end();
                }
            });
        });
    });
}

function setOwner(req, res) {
    var data = req.body;
    if (util.isNullOrUndefined(data.owner)) {
        res.sendStatus(400);
        return;
    }
    lib.getConnection(function (error, conn) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            conn.end();
            return;
        }
        conn.query("SELECT * FROM `coupons` WHERE coupon_id='" + req.params.id + "'", function (err) {
            if (err) {
                res.statusCode = 500;
                res.json({"error": 500, "desc": error.stack});
                conn.end();
                return;
            }
            conn.query("UPDATE `coupons` SET coupon_owner='" + data.owner +
                "' WHERE coupon_id='" + req.params.id + "'", function (err) {
                if (err) {
                    res.statusCode = 500;
                    res.json({"error": 500, "desc": error.stack});
                    conn.end();
                    return;
                }
                res.sendStatus(200);
            })
        });
    });
}

function setPaid(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecting to DB");
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            return;
        }
        conn.query("UPDATE `coupons` SET coupon_paid=1, coupon_date_paid=" +
            new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +
            " WHERE coupon_id='" + req.params.id + "'", function (err, rows, fields) {
            conn.end();
            if (err) {
                res.statusCode = 500;
                res.json({"error": 500, "desc": err.stack});
                console.error("Smthng gone wrong. Stack: " + err.stack);
            }
            res.redirect("/coupons/createChildren/" + req.params.id);
        });
    });
}

function createChildren(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecting to DB");
            return;
        }
        conn.query("SELECT `coupon_price`,`coupon_item` FROM coupons WHERE coupon_id='" + req.params.id + "'", function (err, rows, fields) {
            var item = rows[0].coupon_item;
            var price = rows[0].coupon_price;
            var generatedId;
            var resultJson = "[";
            var isError = false;
            for (var i = 0; i < CHILDRENAMOUNT; i++) {
                generatedId[i] = lib.getNewHash();
                resultJson += "\"" + generatedId[i] + "\",";
                conn.query("INSERT INTO `coupons`(`coupon_id`, `coupon_item`,`coupon_price`) VALUES ('" + generatedId[i] + "', " +
                    item + ", " + price + ")", function (err, rows, fields) {
                    if (err) {
                        res.statusCode = 500;
                        res.json({"error": 500, "desc": err.stack});
                        console.error("Smthg gone wrong, stack: " + err.stack);
                        isError = true;
                    }
                });
                if (isError) {
                    conn.end();
                    return;
                }
            }
            conn.query("UPDATE `coupons` SET children='" + resultJson.substring(0, resultJson.length - 1) + "]' WHERE coupon_id='" + req.params.id + "'", function (err) {
                if (err) {
                    res.statusCode = 500;
                    res.json({"error": 500, "desc": err.stack});
                    console.error("Smthg gone wrong, stack: " + err.stack);
                    conn.end();
                }
            });
        });
        conn.end();
    });
    res.redirect("/coupons/" + req.params.id);
}

function getAll(req, res) {
    var conn = lib.getConnection(function (err) {
        if (err) {
            console.error("Error connecing to database: " + err.stack);
            res.statusCode = 500;
            res.json({"error": 500, "desc": err.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);

        conn.query("SELECT * FROM coupons", function (err, rows, fields) {
            if (err) {
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
                r += "{\"id\": \"" + i.coupon_id + "\", \"owned\": \"" + i.coupon_owned + "\", " +
                    "\"paid\": " + i.coupon_paid + ", \"price\": " + i.coupon_price + ", \"currency\": \"" + i.coupon_currency +
                    "\", \"item\": " + i.coupon_item + ", \"date_created\": \"" + i.coupon_date_created + "\", " +
                    "\"date_paid\": \"" + i.coupon_date_paid + "\", \"children\": " + i.coupon_children + "},";
            });
            res.send(r.substring(0, r.length - 1) + "]");
            conn.end()
        });
    });
}

function getById(req, res) { //get certain coupon by id
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({'error': 500, 'desc': error.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);

        conn.query("SELECT * FROM coupons WHERE coupon_id='" + req.params.id + "'", function (err, rows, fields) { //if connected successfully, get record
            if (err) {
                res.statusCode = 500;
                res.json({error: 500, desc: "Error connecting to DB: " + err.stack});
                conn.end();
                return;
            }
            if (util.isUndefined(rows[0])) { // check whether query didn't return record
                res.sendStatus(404); // send not found
                conn.end();
                return;
            }
            var i = rows[0];
            if (util.isNullOrUndefined(i)) {
                res.sendStatus(209);
                conn.end();
                return;
            }
            var r = "{\"id\": \"" + i.coupon_id + "\", \"owned\": \"" + i.coupon_owned + "\", " +
                "\"paid\": " + i.coupon_paid + ", \"price\": " + i.coupon_price + ", \"currency\": \"" + i.coupon_currency +
                "\", \"item\": " + i.coupon_item + ", \"date_created\": \"" + i.coupon_date_created + "\", " +
                "\"date_paid\": \"" + i.coupon_date_paid + "\", \"children\": " + i.coupon_children + "}"; // create response json string
            res.type("application/json");
            res.send(r);
            conn.end();
        });
    });//connect to the database and throw 500 INTERNAL SERVER ERROR if error
}

function newCoupon(req, res) {
    var data = req.body;
    var generatedId = lib.getNewHash();
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);

        if (util.isNullOrUndefined(data.owned) || util.isNullOrUndefined(data.price) || util.isNullOrUndefined(data.item)) {
            res.statusCode = 400;
            res.json({"error": 400, "desc": 'Incomplete request. Cannot create coupon'});
            conn.end();
            return;
        } else {
            conn.query("INSERT INTO coupons(`coupon_id`,`coupon_item`,`coupon_owned`,`coupon_price`) " +
                "VALUES('" + generatedId + "'," + data.item + ",'" + data.owned + "'," + data.price + ");", function (err) {
                if (err) {
                    console.error("Error creating coupon from ip " + req.ip + "; Desc: " + err.stack);
                    res.statusCode = 500;
                    res.json({"error": 500, "desc": err.stack});
                    conn.end();
                    return;
                }
                if (data.paid == 1 || data.paid == '1' || data.paid == true || data.paid == 'true') {
                    conn.query("UPDATE `coupons` SET coupon_paid=1 WHERE coupon_id='" + generatedId + "'", function (error) {
                        if (error) {
                            res.statusCode = 500;
                            res.json({"error": 500, "desc": error.stack});
                            conn.end();
                            return;
                        }
                        res.redirect("/coupons/createChildren/" + generatedId);
                        conn.end();
                    });
                } else res.redirect("/coupons/" + generatedId);
            });
        }
        conn.end();
    });
}

function del(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);

        conn.query("SELECT * FROM `coupons` WHERE coupon_id='" + req.params.id + "'", function (err, rows, fields) {
            if (err) {
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
            conn.query("DELETE FROM `coupons` WHERE coupon_id='" + req.params.id + "'", function (err1) {
                if (err1) {
                    res.statusCode = 500;
                    res.json({"error": 500, "desc": err1.stack});
                    conn.end();
                    return;
                }
            })
        });
    });
}

module.exports.getAll = getAll();
module.exports.getById = getById();
module.exports.new = newCoupon();
module.exports.delete = del();
module.exports.createChildren = createChildren();
module.exports.setPaid = setPaid();
module.exports.setOwner = setOwner();
module.exports.modify = modify();