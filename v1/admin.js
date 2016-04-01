var lib = require("./lib.js");
var util = require("util");

function td(content) {
    return "<td>" + content + "</td>";
}
function tr(content) {
    return "<tr>" + content + "</tr>";
}

//table -> tr -> td
function table(head, rows) {
    if (typeof head !== "object" || typeof rows !== "object") return;
    var result_html =
        "<style>\n" +
        "table, tr, td {\nborder-collapse: collapse; \nborder: solid black 1px; \npadding: 5px;\n}\n" +
        "</style>\n<table>\n";
    var head_content_html = "";
    head.forEach(function (head_cell) {
        head_content_html += td(head_cell);
    });
    result_html += tr(head_content_html);

    rows.forEach(function (row) {
        var row_html = "";
        row.forEach(function (row_cell) {
            row_html += td(row_cell);
        });
        result_html += tr(row_html) + "\n";
    });
    result_html += "</table>";
    return result_html;
}

function getPriceTable(req, res) {
    lib.getConnection(function (error, connection) {
        if (error) {
            res.statusCode = 500;
            res.json({"error": 500, "desc": error.stack()});
            connection.end();
            return;
        }
        connection.query("SELECT * FROM `items`", function (err, rows, fields) {
            var table_head = [], table_rows = [];
            fields.forEach(function (field) {
                table_head.push(field.name);
            });
            console.log(Object.keys(rows[0]));
            console.log(lib.objectValues(rows[0]));
            rows.forEach(function (row) {
                table_rows.push(lib.objectValues(row));
            });
            res.send(table(table_head, table_rows));
            connection.end();
        });
    });
}

module.exports.tableGenerator = table;
module.exports.getPriceTable = getPriceTable;