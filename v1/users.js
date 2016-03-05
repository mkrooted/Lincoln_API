var util = require("util");
var lib = require("./lib.js");

function getAll(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);

        conn.query("SELECT * FROM users", function (err, rows, fields) { //if conected successfully, get all records from table
            if (err) {
                res.statusCode = 500;
                res.json({"error": 500, "desc": err.stack});
                conn.end();
                return;
            }
            res.type("application/json"); //set Content-type HTTP header
            var r = "[";
            rows.forEach(function (i) { // goes through returned array of users. adds json object with record to result string
                r += "{\"login\": \"" + i.user_login + "\", \"password\": \"" +
                    i.user_password + "\", \"hash\": \"" + i.user_hash + "\", \"last_ip\": \"" + i.user_last_ip +
                    "\", \"email\": \"" + i.user_email + "\", \"date_registered\": \"" + i.user_date_registered + "\", \"last_login\": \"" +
                    i.user_date_last_login + "\", \"wmid\": \"" + i.user_wmid + "\"},";

            });
            res.send(r.substring(0, r.length - 1) + "]"); //replace last character of result string to ']' from ','
            conn.end();
        });
    });
}

function getByLogin(req, res) { //get certain user by login
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({'error': 500, 'desc': 'Error connecting to DB: ' + error.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);

        conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) { //if connected successfully, get record
            if (util.isUndefined(rows[0])) { // check whether query didn't return record
                res.sendStatus(404); // send not found
                conn.end();
                return;
            }
            var i = rows[0];
            var r = "{\"login\": \"" + i.user_login + "\", \"password\": \"" +
                i.user_password + "\", \"hash\": \"" + i.user_hash + "\", \"last_ip\": \"" + i.user_last_ip +
                "\", \"email\": \"" + i.user_email + "\", \"date_registered\": \"" + i.user_date_registered + "\", \"last_login\": \"" +
                i.user_date_last_login + "\", \"wmid\": \"" + i.user_wmid + "\"}"; // create response json string
            res.type("application/json");
            res.send(r);
            conn.end();
        });
    });
}

function newUser(req, res) { // create new user from given json config
    var data = req.body; // parse for json and get data
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({error: 500, desc: "Error connecting to DB: " + error.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);

        if (util.isNullOrUndefined(data.login) || util.isNullOrUndefined(data.email) || util.isNullOrUndefined(data.password)
            || util.isNullOrUndefined(data.wmid)) { // check whether all data is provided
            res.sendStatus(400);
            conn.end();
        } else {
            conn.query("INSERT INTO users(`user_login`,`user_email`,`user_password`,`user_wmid`,`user_last_ip`) " +
                "VALUES('" + data.login + "','" + data.email + "','" + data.password + "','" + data.wmid + "','" + req.ip + "');", function (err) {
                if (err) { // check for errors while executing query
                    if (err.stack.indexOf("ER_DUP_ENTRY") > -1) { // login taken? (workaround - searches for substring in error message)
                        res.sendStatus(409);
                    } else { // else simply send 500 code and error stack
                        console.error("Error creating user from ip " + req.ip + "; Desc: " + err.stack);
                        res.statusCode = 500;
                        res.json({"error": 500, "desc": err.stack});
                    }
                    conn.end();
                    return;
                } else res.redirect("/users/" + data.login); //if successfully, redirect to created user page
                conn.end();
            });
        }
    });
}

function modify(req, res) { // modify user according to given json config
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);

        conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) { //user exists?
            if (util.isUndefined(rows[0])) {
                res.sendStatus(404);
                conn.end();
                return;
            }
            var data = req.body; // parse body for json. get data
            var sql = "";

            //here it checks whether parameter is given. If given, adds to sql multi-query corresponding statement
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
            conn.query(sql, function (err, rows, fields) { //execute created multi-query
                if (err) {
                    res.statusCode = 500;
                    res.json({"error": 500, "desc": err.stack});
                    conn.end();
                    return
                }
                res.redirect("/users/" + req.params.id);
            });
            conn.end();
        });
    });
}

function del(req, res) {
    lib.getConnection(function (error, conn) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack});
            conn.end();
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
        conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) { // exists?
            if (util.isUndefined(rows[0])) {
                res.sendStatus(404);
                conn.end();
                return;
            }
            conn.query("DELETE FROM `users` WHERE user_login='" + req.params.login + "'", function (err, rows, fields) { //delete user
                if (err) {
                    res.statusCode = 500;
                    res.json({"error": 500, "desc": err.stack});
                    conn.end();
                    return;
                }
                res.sendStatus(200);
                conn.end();
            });
        });
    });
}

module.exports.getAll = getAll();
module.exports.getByLogin = getByLogin();
module.exports.new = newUser();
module.exports.modify = modify();
module.exports.delete = del();