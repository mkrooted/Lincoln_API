var mysql = require("mysql");
var crypto = require("crypto");

function getConnection(callb) //returns connection to DB. callback - function to execute if error
{
    if (typeof callb === "function") {
        var c;
        try {
            c = mysql.createConnection({ // pool for mysql connections
                host: "localhost",
                port: "3306",
                user: "dev",
                password: "mlg_quickscoper",
                database: "lincoln_project",
                multipleStatements: true,
                debug: false
            });
        } catch (err) {
            callb(err);
            return;
        }

        callb(null, c);
    }
}
function getNewHash() //generates random 20 bytes and returns their HEX representation
{
    return crypto.randomBytes(20).toString('hex');
}

module.exports.getConnection = getConnection;
module.exports.getNewHash = getNewHash;

