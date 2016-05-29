var mysql = require("mysql");
var crypto = require("crypto");
var fs = require("fs");

var CONFIG;
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
        var config = JSON.parse(fs.readFileSync("apiconfig.json"));
        try {
            c = mysql.createConnection({ // pool for mysql connections
                host: config.dbhost,
                port: config.dbport,
                user: config.dbuser,
                password: config.dbpass,
                database: config.dbname,
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

function isIpBelongsToWebmoney(ip) {
    if (typeof ip != "string") {
        return undefined;
    }
    var KOTE101 = [ // WEBMONEY IPs
        /^(212\.118\.48\.)(\d{1,3})$/g,
        /^(212\.158\.173\.)(\d{1,3})$/g,
        /^(91\.200\.28\.)(\d{1,3})$/g,
        /^(91\.227\.52\.)(\d{1,3})$/g
    ];

    var boxOnTheWall = false;
    KOTE101.forEach(function (regex) {
        if (ip.match(regex))boxOnTheWall = true;
    });
    return boxOnTheWall;
}

function sha256(str) {
    return crypto.createHash("sha256", str);
}

function setConfig(config) {
    CONFIG = config;
}

function randomInt(low, high) {
    console.log(typeof low, typeof high);
    console.log(Math.floor(Math.random() * (high - low) + low));
    return Math.floor(Math.random() * (high - low) + low);
}

module.exports.objectValues = objectValues;
module.exports.getConnection = getConnection;
module.exports.getNewHash = getNewHash;
module.exports.isAboveValue = isAboveValue;
module.exports.isIpBelongsToWebmoney = isIpBelongsToWebmoney;
module.exports.sha256 = sha256;
module.exports.setConfig = setConfig;
module.exports.randomInt = randomInt;
module.exports.itemTypes = item_types;
module.exports.LKconstants = LKconstant;
module.exports.LKconstPlusOne = LKconstPlusOne;
module.exports.DetectionModes = detectionModes;
module.exports.CONFIG = CONFIG;
