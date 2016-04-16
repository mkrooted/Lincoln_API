var mysql = require("mysql");
var crypto = require("crypto");

var item_types = {"knife": 1, "gun": 0};
var LKconstant = {"normal": 0.075, "weak": 0.03, "hardcore": 0.1}; //Lobanov-Koreshkov constants
var LKconstPlusOne = {
    "normal": LKconstant["normal"] + 1,
    "weak": LKconstant["weak"] + 1,
    "hardcore": LKconstant["hardcore"] + 1
};
var detectionModes = {"normal": 1, "weak": 0, "hardcore": 2};

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
function isAboveValue(checked, reference, percent) {
    var floater = percent > 1 ? percent / 100 : percent;
    return checked + checked * floater >= reference;
}

function objectValues(obj) {
    var keies = Object.keys(obj);
    var result = [];
    for (var i = 0; i < keies.length; i++) {
        result.push(obj[keies[i]]);
    }
    return result;
}

module.exports.objectValues = objectValues;
module.exports.getConnection = getConnection;
module.exports.getNewHash = getNewHash;
module.exports.isAboveValue = isAboveValue;
module.exports.itemTypes = item_types;
module.exports.LKconstants = LKconstant;
module.exports.LKconstPlusOne = LKconstPlusOne;
module.exports.DetectionModes = detectionModes;