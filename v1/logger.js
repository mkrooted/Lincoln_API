var fs = require("fs");
var logLevel = {
    warning: "WARNING",
    error: "ERROR",
    info: "INFO",
    debug: "DEBUG",
    fatal: "FATAL ERROR"
};

var date = new Date();
var CONFIG;

fs.readFile("apiconfig.json", function (error, content) {
    CONFIG = JSON.parse(content);
});
fs.stat(logfilename(), function (stats) {
    if (!stats.isFile()) {
        date = new Date();
        fs.writeFileSync(logfilename(), date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " - INFO - Log file created");
    }
});
function logfilename() {
    if (typeof CONFIG == "undefined")return undefined;
    else return CONFIG.logPath + "log_" + date.getDay() + "-" + date.getMonth() + "-" + date.getFullYear() + ".mklog";
}

function updateTime() {
    date = new Date();
    logfilename = CONFIG.logPath + "log_" + date.getDay() + "-" + date.getMonth() + "-" + date.getFullYear();
}
function log(level, data) {
    if (typeof logfilename() == "undefined") {
        fs.appendFileSync("logger_errors.log", date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " - ");
        return undefined;
    }
    fs.appendFileSync(logfilename(), date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + " - " + level + " - " + data);
}

module.exports.log = log;
module.exports.updateTime = updateTime;
module.exports.logLevels = logLevel;
