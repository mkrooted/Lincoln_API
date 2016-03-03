var util = require("util");
var lib = require("./lib.js");

function getAll(req, res) { //get all records from table 'users'
    var conn = lib.getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.send("{error: 500, desc: 'Error connecting to DB: " + error.stack + "'}");
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    }); //connect to the database and throw 500 INTERNAL SERVER ERROR if error
    conn.query("SELECT * FROM users", function (err, rows, fields) { //if conected successfully, get all records from table
        if (err) {
            res.statusCode = 500;
            res.json({error: 500, desc: "Error executing query: " + err.stack}); //send 500 code and json error description
            return;
        } //handle errors while executing query
        res.statusCode = 200; // all is ok, set 200 status code
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
} //get all records from table 'users'
function getByLogin(req, res) { //get certain user by login
    var conn = lib.getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({'error': 500, 'desc': 'Error connecting to DB: ' + error.stack});
            conn.end();
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw 500 INTERNAL SERVER ERROR if error
    conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) { //if connected successfully, get record
        if (util.isUndefined(rows[0])) { // check whether query didn't return record
            res.statusCode = 404; // send not found
            res.send("{error: 404, desc:'User with login " + req.params.login + " not found'}"); // json with error description
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
} //get certain user by login
function newUser(req, res) { // create new user from given json config
    var data = req.body; // parse for json and get data
    var conn = lib.getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({error: 500, desc: "Error connecting to DB: " + error.stack});
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error
    if (util.isNullOrUndefined(data.login) || util.isNullOrUndefined(data.email) || util.isNullOrUndefined(data.password)
        || util.isNullOrUndefined(data.wmid)) { // check whether all data is provided
        res.statusCode = 400;
        res.send("{error: 400, desc:'Incomplete request. Cannot create user'}");
        conn.end();

    } else {
        conn.query("INSERT INTO users(`user_login`,`user_email`,`user_password`,`user_wmid`,`user_last_ip`) " +
            "VALUES('" + data.login + "','" + data.email + "','" + data.password + "','" + data.wmid + "','" + req.ip + "');", function (err) {
            if (err) { // check for errors while executing query
                if (err.stack.indexOf("ER_DUP_ENTRY") > -1) { // login taken? (workaround - searches for substring in error message)
                    res.statusCode = 409;
                    res.json({"error": 409, "desc": "Login taken"});
                } else { // else simply send 500 code and error stack
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
            } else res.redirect("/users/" + data.login); //if successfully, redirect to created user page
            conn.end();
        });
    }
} // create new user from given json config
function modify(req, res) { // modify user according to given json config
    var conn = lib.getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({'error': 500, 'desc': 'Error connecting to DB: ' + error.stack});
            conn.end();
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error

    conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) { //user exists?
        if (util.isUndefined(rows[0])) {
            res.statusCode = 404;
            res.json({error: 500, desc: "Error connecting to DB: " + error.stack});
            conn.end();
        }
    }); // user exists?

    var data = req.body; // parse body for json. get data
    var sql = "";

    //here it checks whether parameter is given. If given, adds to sql query corresponding statement
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
            res.json({"error": 500, "desc": "Something gone wrong while executing query", "stack": err.stack});
            conn.end();

        }
    });

    res.sendStatus(200);
    conn.end();
}
function del(req, res) {
    var conn = lib.getConnection(function (error) {
        if (error) {
            console.error("Error connecing to database: " + error.stack);
            res.statusCode = 500;
            res.json({error: 500, desc: "Error connecting to DB: " + error.stack});
            conn.end();
            return;
        }
        console.log("Connection to dev@localhost successful! Connection ID: " + conn.threadId);
    });//connect to the database and throw ACHTUNG 500 INTERNAL SERVER ERROR if error
    conn.query("SELECT * FROM users WHERE user_login='" + req.params.login + "'", function (err, rows, fields) { // exists?
        if (util.isUndefined(rows[0])) {
            res.statusCode = 404;
            res.send("{error: 404, desc:'User with login " + req.params.login + " not found'}");
            conn.end();

        }
    }); // exists?

    conn.query("DELETE FROM `users` WHERE user_login='" + req.params.login + "'", function (err, rows, fields) { //delete user
        if (err) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": "Something gone wrong while executing query", "stack": err.stack});
        }
    });
    conn.end();
    res.sendStatus(200);
}

module.exports.getAll = getAll();
module.exports.getByLogin = getByLogin();
module.exports.new = newUser();
module.exports.modify = modify();
module.exports.delete = del();