var request = require("request");
var EventEmitter = require('events').EventEmitter
var priceProvider = new EventEmitter();

const CURRENCY = {
    "rub": 5,
    "usd": 1
};
const QUALITY_SEARCH = { // misc additions
    "stattrack": "tag_strange",
    "souvenir": "tag_tournament",
    "star": "tag_unusual",
    "star+stattrack": "tag_unusual_strange",
    "normal": "tag_normal"
};
const EXTERIOR_SEARCH = { // quality
    "factory-new": "tag_WearCategory0",
    "minimal_wear": "tag_WearCategory1",
    "field-tested": "tag_WearCategory2",
    "well-worn": "tag_WearCategory3",
    "battle-scarred": "tag_WearCategory4"
};
const TYPE_SEARCH = {
    "pistol": "tag_CSGO_Type_Pistol",
    "smg": "tag_CSGO_Type_SMG",
    "sniper": "tag_CSGO_Type_SniperRifle",
    "rifle": "tag_CSGO_Type_Rifle",
    "shotgun": "tag_CSGO_Type_Shotgun",
    "machinegun": "tag_CSGO_Type_Machinegun",
    "knife": "tag_CSGO_Type_Knife",
    "key": "tag_CSGO_Type_Key",
    "container": "tag_CSGO_Type_Container"
};
const EXTERIOR = {
    "factory-new": "Factory%20new",
    "minimal_wear": "Minimal%20wear",
    "field-tested": "Field-tested",
    "well-worn": "Well-worn",
    "battle-scarred": "Battle-scarred"
};

const URL_HOST = "steamcommunity.com";
const URL_SEARCH = "http://steamcommunity.com/market/search";
const URL_LISTING = "http://steamcommunity.com/market/listings/730/";
const URL_PRICEOVERVIEW = "/market/priceoverview/?appid=730";
const SEARCH_TEMPLATE = "q={1}&" +
    "category_730_itemSet%5B%5D={2}&" +
    "category_730_ProPlayer%5B%5D={3}&" +
    "category_730_StickerCapsule%5B%5D={4}&" +
    "category_730_TournamentTeam%5B%5D={5}&" +
    "category_730_Weapon%5B%5D={6}" +
    "category_730_Exterior%5B%5D={7}" +
    "category_730_Quality%5B%5D={8}" +
    "appid=730"; //default: {n} = 'any'
const LISTING_TEMPLATE = "{star}%20{stattrack}%20{name}%20%7C%20{skin}%20%28{wear}%29";

module.exports.priceProvider = priceProvider;
module.exports.getPrice = getPrice;
module.exports.currency = CURRENCY;

function formatListingUrl(starred, stattrack, name, skin, wear) {
    var result = "";
    if (starred === 1 || starred === true)result += "%E2%98%85%20";
    if (stattrack === 1 || stattrack === true)result += "StatTrak™%20";
    result += name.replace(/ /g, "%20");
    if (typeof skin !== "undefined" && typeof skin === "string")result += ("%20%7C%20" + skin.replace(/ /g, "%20"));
    if (typeof wear !== "undefined" && typeof skin === "string")result += ("%20%28" + wear.replace(/ /g, "%20") + "%29");
    return result;
}
function formatPriceOverviewUrl(currency, starred, stattrack, name, skin, wear) {
    var result = URL_PRICEOVERVIEW;
    result +=
        "&currency=" + String(currency) +
        "&market_hash_name=" + formatListingUrl(starred, stattrack, name, skin, wear);
    return result;
}

function getPrice(currency, starred, stattrack, name, skin, wear) {
    var url = "http://" + URL_HOST + formatPriceOverviewUrl(currency, starred, stattrack, name, skin, wear);
    console.log("URL:", url);

    request({method: "GET", uri: url, gzip: true}, function (error, res, body) {
        if (error || res.statusCode != 200) {
            console.error("Error retrieving data from", url);
            return;
        }
        if (!JSON.parse(body).success) return;
        var Result = currency == CURRENCY.usd ? JSON.parse(body).lowest_price.substr(1) : JSON.parse(body).lowest_price.substring(0, JSON.parse(body).lowest_price.indexOf("p"));

        priceProvider.emit(
            'newPrice',
            {
                "currency": currency,
                "starred": starred,
                "stattrack": stattrack,
                "name": name,
                "skin": skin,
                "wear": wear,
                "price": Result
            }
        )
    });
}
