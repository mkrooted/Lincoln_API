// Lincoln_API Project. github.com/mkrooted/lincoln_api

var util = require("util");
var express = require("express");
var validator = require("validator");
var crypto = require("crypto");
var bodyParser = require('body-parser');
var regexp = require("node-regexp");
var app = express();
app.locals.title = "Lincoln_API";
app.locals.email = "koreshov.m@gmail.com";
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

function getConnection(callback) {
    var conn;
    try {
        conn = require("mysql").createConnection({ // pool for mysql connections
            host: "localhost",
            port: "3306",
            user: "dev",
            password: "mlg_quickscoper",
            database: "lincoln_project",
            multipleStatements: true,
            debug: false
        });
    } catch (err) {
        callback(err);
    }
    return conn;
}

var connectionCount = 0;

function getNewHash() //generates random 20 bytes and returns their HEX representation
{
    return crypto.randomBytes(20).toString('hex');
}

// USERS SECTION
app.get("/users", function (req, res) {
    res.type('text/plain');
    var conn = getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error connecting to DB: " + error.stack + "'}");
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error
    conn.query("SELECT * FROM users", function (err, rows, fields) {
        if (err) {
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error executing query: " + error.stack + "'}");
            return;
        }
        res.statusCode = 200;
        res.type("application/json");
        var r = "[";
        rows.forEach(function (i) {
            r += "{\"login\": \"" + i.user_login + "\", \"password\": \"" +
                i.user_password + "\", \"hash\": \"" + i.user_hash + "\", \"last_ip\": \"" + i.user_last_ip +
                "\", \"email\": \"" + i.user_email + "\", \"date_registered\": \"" + i.user_date_registered + "\", \"last_login\": \"" +
                i.user_date_last_login + "\", \"wmid\": \"" + i.user_wmid + "\"},";

        });
        res.send(r.substring(0, r.length - 1) + "]");
        conn.end();
    });//if conected successfully get all records from table
}); //get all records from table 'users'
app.get("/users/:login", function (req, res) {
    res.type('text/plain');
    var conn = getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({'error': 500, 'desc': 'Error connecting to DB: ' + error.stack});
            conn.end();
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error
    conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) {
        if (util.isUndefined(rows[0])) {
                res.statusCode = 404;
            res.send("{error: 404, desc:'User with login " + req.params.login + " not found'}");
            conn.end();
                return;
            }
            var i = rows[0];
        var r = "{\"login\": \"" + i.user_login + "\", \"password\": \"" +
            i.user_password + "\", \"hash\": \"" + i.user_hash + "\", \"last_ip\": \"" + i.user_last_ip +
            "\", \"email\": \"" + i.user_email + "\", \"date_registered\": \"" + i.user_date_registered + "\", \"last_login\": \"" +
            i.user_date_last_login + "\", \"wmid\": \"" + i.user_wmid + "\"}";
        res.type("application/json");
            res.send(r);
        conn.end();
        });
}); //get certain user by login
app.post("/users", function (req, res) {
    var data = req.body;
    var conn = getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error connecting to DB: " + error.stack + "'}");
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error
    if (util.isNullOrUndefined(data.login) || util.isNullOrUndefined(data.email) || util.isNullOrUndefined(data.password)
        || util.isNullOrUndefined(data.wmid)) {
        res.statusCode = 400;
        res.send("{error: 400, desc:'Incomplete request. Cannot create user'}");
        conn.end();
        return;
    } else {
        conn.query("INSERT INTO users(`user_login`,`user_email`,`user_password`,`user_wmid`,`user_last_ip`) " +
            "VALUES('" + data.login + "','" + data.email + "','" + data.password + "','" + data.wmid + "','" + req.ip + "');", function (err) {
            if (err) {
                if (err.stack.indexOf("ER_DUP_ENTRY") > -1) {
                    res.statusCode = 409;
                    res.json({"error": 409, "desc": "Login taken"});
                } else {
                    console.error("Error creating user from ip " + req.ip + "; Desc: " + err.stack);
                    res.statusCode = 500;
                    res.json({
                        "error": 500,
                        "desc": "Something gone wrong while creating user record",
                        "stack": err.stack
                    });
                }
                conn.end();
                return;
            } else res.sendStatus(200);
            conn.end();
        });
    }
});
app.patch("/users/:login", function (req, res) {
    var conn = getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({'error': 500, 'desc': 'Error connecting to DB: ' + error.stack});
            conn.end();
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error

    conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) {
        if (util.isUndefined(rows[0])) {
            res.statusCode = 404;
            res.send("{error: 404, desc:'User with login " + req.params.login + " not found'}");
            conn.end();
            return;
        }
    });

    var data = req.body;
    var sql = "";

    if (!util.isUndefined(data.email)) {
        sql += "UPDATE `users` SET `user_email`='" + data.email + "' WHERE `user_login`='" + req.params.login + "';\n";
    }
    if (!util.isUndefined(data.password)) {
        sql += "UPDATE `users` SET `user_password`='" + data.password + "' WHERE `user_login`='" + req.params.login + "';\n";
    }
    if (!util.isUndefined(data.hash)) {
        sql += "UPDATE `users` SET `user_hash`='" + data.hash + "' WHERE `user_login`='" + req.params.login + "';\n";
    }
    if (!util.isUndefined(data.last_ip)) {
        sql += "UPDATE `users` SET `last_ip`='" + data.last_ip + "' WHERE `user_login`='" + req.params.login + "';\n";
    }
    if (!util.isUndefined(data.deleted)) {
        sql += "UPDATE `users` SET `user_deleted`=" + data.deleted + " WHERE `user_login`='" + req.params.login + "';\n";
    }
    if (!util.isUndefined(data.last_login)) {
        sql += "UPDATE `users` SET `user_date_last_login`=NOW() WHERE `user_login`='" + req.params.login + "';\n";
    }
    if (!util.isUndefined(data.wmid)) {
        sql += "UPDATE `users` SET `user_wmid`='" + data.wmid + "' WHERE `user_login`='" + req.params.login + "';\n";
    }
    conn.query(sql, function (err, rows, fields) {
        if (err) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": "Something gone wrong while executing query", "stack": err.stack});
            conn.end();
            return;
        }
    });

    res.sendStatus(200);
    conn.end();
});
app.delete("/users/:login", function (req, res) {
    var conn = getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({'error': 500, 'desc': 'Error connecting to DB: ' + error.stack});
            conn.end();
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error
    conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) {
        if (util.isUndefined(rows[0])) {
            res.statusCode = 404;
            res.send("{error: 404, desc:'User with login " + req.params.login + " not found'}");
            conn.end();
            return;
        }
    });

    conn.query("DELETE FROM `users` WHERE user_login='" + req.params.login + "'", function (err, rows, fields) {
        if (err) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": "Something gone wrong while executing query", "stack": err.stack});
        }
    })
    conn.end();
    res.sendStatus(200);
});

// SALES SECTION
app.get("/sales", function (req, res) {
    var conn = getConnection(function (err) {
        if (err) {
            console.error("Error connecing to database: " + err.stack);
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error connecting to DB: " + err.stack + "'}");
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });

    conn.query("SELECT * FROM sales", function (err, rows, fields) {
        if (err) {
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error executing query: " + error.stack + "'}");
            return;
        }
        res.statusCode = 200;
        res.type("application/json");
        var r = "[";
        rows.forEach(function (i) {
            r += "{\"id\": \"" + i.sale_id + "\", \"owned\": \"" + i.sale_owned + "\", " +
                "\"paid\": " + i.sale_paid + ", \"price\": " + i.sale_price + ", \"currency\": \"" + i.sale_currency +
                "\", \"item\": " + i.sale_item + ", \"date_created\": \"" + i.sale_date_created + "\", " +
                "\"date_paid\": \"" + i.sale_date_paid + "\", \"children\": " + i.sale_children + "},";
        });
        res.send(r.substring(0, r.length - 1) + "]");
        conn.end()
    });
});
app.post("/sales", function (req, res) {
    var data = req.body;
    var conn = getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error connecting to DB: " + error.stack + "'}");
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error
    if (util.isNullOrUndefined(data.owned) || util.isNullOrUndefined(data.paid) || util.isNullOrUndefined(data.price)
        || util.isNullOrUndefined(data.currency) || util.isNullOrUndefined(data.item)) {
        res.statusCode = 400;
        res.send("{error: 400, desc:'Incomplete request. Cannot create sale'}");
        conn.end();
        return;
    } else {
        conn.query("INSERT INTO sales(`sale_id`,`user_email`,`user_password`,`user_wmid`,`user_last_ip`) " +
            "VALUES('" + data.login + "','" + data.email + "','" + data.password + "','" + data.wmid + "','" + req.ip + "');", function (err) {
            if (err) {
                console.error("Error creating user from ip " + req.ip + "; Desc: " + err.stack);
                res.statusCode = 500;
                res.json({
                    "error": 500,
                    "desc": "Something gone wrong while creating user record",
                    "stack": err.stack
                });
                conn.end();
                return;
            } else res.sendStatus(200);
            conn.end();
        });
    }
});

app.listen(2016);