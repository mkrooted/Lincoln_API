var lib = require("./lib");
var fs = require("fs");

function paymentSuccessful(req, res) {
    if (!lib.isIpBelongsToWebmoney(req.ip)) {
        // ТУТ ДОЛЖНО НАЧАТЬСЯ НЕБОЛЬШОЕ БЕСПОКОЙСТВО,
        // ИБО НАС КАКИЕ ТО ЛЕВЫЕ РУССКИЕ ШКОЛЬНИКИ ПОПЫТАЛИСЬ ОБМАНУТЬ,
        // НО НЕ ПРЕДУСМОТРЕЛИ ПРОВЕРКУ АЙПИ И ВСЕ ВРОДЕ НОРМ
        return;
    }
    var details = {
        "myWmid": req.body.LMI_PAYEE_PURSE,
        "cost": req.body.LMI_PAYMENT_AMOUNT,
        "orderId": req.body.LMI_PAYMENT_NO,
        "inTest": req.body.LMI_MODE,
        "WMOrderId": req.body.LMI_SYS_TRANS_NO,
        "WMAccountId": req.body.LMI_SYS_INVS_NO,
        "customerWallet": req.body.LMI_PAYER_PURSE,
        "customerWmid": req.body.LMI_PAYER_WM,
        "HASH": req.body.LMI_HASH,
        "datetime": req.body.LMI_SYS_TRANS_DATE,
        "secret": req.body.LMI_SECRET_KEY,
        "desc": req.body.LMI_PAYMENT_DESC,
        "location": req.body.LMI_PAYER_COUNTRYID,
        "ip": req.body.LMI_PAYER_IP,
        "fullCost": req.body.IW_FULLCOST, // CUSTOM PARAM THAT TELLS ABOUT DELETING CHILD COUPONS. boolean
        "couponId": req.body.IW_COUPON_ID, // CUSTOM PARAM THAT SHOWS WHAT COUPON IS ABOUT TO BE PAID. hash 40 length
        "customerLogin": req.body.IW_CUSTOMER_LOGIN,
        "itemId": req.body.IW_ITEM_ID
    };

    var generatedHash = lib.sha256(
        details.myWmid + details.cost + details.orderId + details.inTest +
        details.WMAccountId + details.WMOrderId + details.datetime +
        (typeof details.secret != "string" || details.secret == "") ? JSON.parse(fs.readFileSync("apiconfig.json")).WMSecret : details.secret +
        details.customerWallet + details.customerWmid
    ).toUpperCase();
    if (details.HASH != generatedHash) {
        // ТУТ ДОЛЖНА БЫТЬ ПРОСТО ТОТАЛЬНАЯ ТРЕВОГА, ИБО НАС ПОПЫТАЛИСЬ КИНУТЬ КУЛХАЦКЕРЫ.
        // ЗАБЛОКИРОВАТЬ ПОЛЬЗОВАТЕЛЯ, ВКЛЮЧИТЬ ВСЕ ТРЕВОГИ, УВЕДОМИТЬ АДМИНОВ, ЗАПРЕТИТЬ ПОКУПКУ ЧЕГО-ЛИБО!
        // потом доделаю
        return;
    }
    lib.getConnection(function (err, conn) {
        if (err) {
            res.statusCode = 500;
            res.json({"error": 500, "stack": err.stack});
            conn.end();
            return;
        }
        conn.query("INSERT INTO orders VALUES (" + details.orderId + ", '" + details.customerLogin + "', " + details.itemId + ", '" +
            details.couponId + "', " + details.WMOrderId + ", '" + details.customerWmid + "', '" + details.desc +
            "', '" + details.ip + "', '" + details.location + ", " + details.inTest + ", NOW())", function (error, rws, flds) {
            if (error) {
                res.statusCode = 500;
                res.json({"error": 500, "stack": err.stack});
                conn.end();
                return;
            }
            conn.end();
            res.redirect("/coupons/" + details.couponId + "/paid");
        });
    });
}