// Created by mkrooted on 21.02.2016.

var util = require("util");
var express = require("express");
var validator = require("validator");
var crypto = require("crypto");
var app = express();
app.locals.title = "Lincoln_API";
app.locals.email = "koreshov.m@gmail.com";

var pool = require("mysql").createPool({
    host: "localhost",
    port: "3306",
    user: "dev",
    password: "mlg_quickscoper",
    database: "lincoln_project",
    connectionLimit: 20,
    debug: false
});

var connectionCount = 0;

function getNewHash() {
    return crypto.randomBytes(20).toString('hex');
}

app.get("/users", function (req, res) {
    res.type('text/plain');
    pool.getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error connecting to DB: " + error.stack + "'}");
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + pool.threadId);
    });

    pool.query("SELECT * FROM users", function (err, rows, fields) {
        res.statusCode = 200;
        var r = "[\n";
        rows.forEach(function (i) {
            r += "{id: '" + i.user_id + "', login: '" + i.user_login + "', password: '" +
                i.user_password + "', hash: '" + i.user_hash + "', last_ip: '" + i.user_last_ip +
                "', email: '" + i.user_email + "', date_registered: '" + i.user_date_registered + "', last_login: '" +
                i.user_date_last_login + "', wmid: '" + i.user_wmid + "}\n";

        });
        r += "]";
        res.send(r);
    });
});
app.get("/users/:id", function (req, res) {
    res.type('text/plain');

    pool.getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error connecting to DB: " + error.stack + "'}");
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + pool.threadId);
    });
    if (validator.isNumeric(req.id)) {
        pool.query("SELECT * FROM users WHERE user_id=" + req.id, function (err, rows, fields) {
            if (util.isUndefined(rows)) {
                res.statusCode = 404;
                res.send("{error: 404, desc:'User with id " + req.id + " not found'}");
                return
            }
            var r = "{id: '" + i.user_id + "', login: '" + i.user_login + "', password: '" +
                i.user_password + "', hash: '" + i.user_hash + "', last_ip: '" + i.user_last_ip +
                "', email: '" + i.user_email + "', date_registered: '" + i.user_date_registered + "', last_login: '" +
                i.user_date_last_login + "', wmid: '" + i.user_wmid + "}";
            res.send(r);
        });
    } else {
        pool.query("SELECT * FROM users WHERE user_login=" + req.id, function (err, rows, fields) {
            if (util.isUndefined(rows)) {
                res.statusCode = 404;
                res.send("{error: 404, desc:'User with login " + req.id + " not found'}");
                return
            }
            var r = "{id: '" + i.user_id + "', login: '" + i.user_login + "', password: '" +
                i.user_password + "', hash: '" + i.user_hash + "', last_ip: '" + i.user_last_ip +
                "', email: '" + i.user_email + "', date_registered: '" + i.user_date_registered + "', last_login: '" +
                i.user_date_last_login + "', wmid: '" + i.user_wmid + "}";
            res.send(r);
        });
    }

});
app.get("/sales", function (req, res) {
    res.type('text/plain');
    pool.getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            return
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + pool.threadId);
    });

    pool.query("SELECT * FROM sales", function (err, rows, fields) {
        res.statusCode = 200;
        var r = "[\n";
        rows.forEach(function (i) {
            r += "{id: '" + i.sale_id + "', owned: '" + i.sale_owned + "', paid: '" +
                i.sale_paid + "', price: '" + i.sale_price + "', currency: '" + i.sale_currency +
                "', item: '" + i.sale_item + "', children: " + i.sale_children + ", date_created: '" +
                i.sale_date_created + "', date_paid: '" + i.sale_date_paid + "}\n";

        });
        r += "]";
        res.send(r);
    });
});


app.listen(2016);