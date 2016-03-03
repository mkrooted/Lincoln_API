var mysql = require("mysql");
var crypto = require("crypto");

function getConnection(callback) //returns connection to DB. callback - function to execute if error
{
    var conn;
    try {
        conn = mysql.createConnection({ // pool for mysql connections
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
function getNewHash() //generates random 20 bytes and returns their HEX representation
{
    return crypto.randomBytes(20).toString('hex');
}

module.exports.getConnection = getConnection();
module.exports.getNewHash = getNewHash();