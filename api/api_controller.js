const axios = require("axios");
const e = require("express");
const { response } = require("express");
const { del } = require("express/lib/application");
const res = require("express/lib/response");
const rand = require("random-seed").create();
require("dotenv").config();

function getArray(num, max) {
    var array = [];
    for (var i = 0; i < num;) {
        var random = getRandomInt(max);
        if (array.indexOf(random) == -1) {
            array[i] = random;
            i++;
        }
    }
    return array;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function Check(array) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        newArray[i] = array[i] % 13;
    }
    newArray.sort(function (a, b) { return b - a });
    var num = newArray[0] - newArray[1];
    var move;
    if (num == 0) {
        move = 13;
    } else if (num == 1) {
        move = 12;
    } else {
        move = num - 1;
    }
    return move;
}
function Result(array) {
    var newArray = [];
    var center;
    for (var i = 0; i < array.length; i++) {
        if (i == 1) {
            center = array[i] % 13;
        } else {
            newArray.push(array[i] % 13);
        }
    }

    newArray.sort(function (a, b) { return b - a });
    var minus = newArray[0] - newArray[1];
    var cal;

    if (center > newArray[1] && center < newArray[0]) {
        switch (minus) {
            case 2:
                cal = 6;
                break;
            case 3:
                cal = 5;
                break;
            case 4:
                cal = 3;
                break;
            default:
                cal = 2;
                break;
        }
    } else {
        if (newArray[0] == newArray[1] && newArray[1] == center) {
            cal = 12;
        } else {
            cal = 0;
        }
    }
    return cal;
}
const user = [];
module.exports = {
    CardOder: async (req, res) => {
        const { userName, token } = req.body;
        var cardOrder = getArray(52, 52);
        user[token] = {
            cardArray: cardOrder,
            userName: userName,
            betAmount: 0,
            raiseAmount: 0,
            userToken: token,
            amount: 0
        }
        try {
            res.json({
                cardOder: user[token].cardArray,
                serverMsg: "Success"
            })
        } catch (err) {
            res.json({
                serverMsg: "Can't find Server!"
            })
        }
    },
    BetRedDog: async (req, res) => {
        const { userName, betAmount, token, amount } = req.body;
        var amountValue = parseFloat(amount);
        var betValue = parseInt(betAmount);
        user[token].amount = amountValue;
        user[token].betAmount = betValue;
        try {
            var card = [];
            card.push(user[token].cardArray[0]);
            card.push(user[token].cardArray[2]);
            var response = Check(card);
            try {
                res.json({
                    move: response,
                    serverMsg: "Success"
                })
            } catch (error) {
                throw new Error("Can't find Server!");
            };
        } catch (err) {
            res.json({
                serverMsg: err.message
            })
        }
    },
    Result: async (req, res) => {
        const { userName, raiseAmount, token, amount } = req.body;
        var raiseValue = parseFloat(raiseAmount);
        var amountValue = parseFloat(amount);
        user[token].raiseAmount = raiseValue;
        user[token].amount = amountValue;
        try {
            var array = [];
            for (var i = 0; i < 3; i++) {
                array.push(user[token].cardArray[i]);
            }
            var response = Result(array);
            var raisePrice = (user[token].raiseAmount + user[token].betAmount) * response;
            var msg = "You win : " + "+" + raisePrice;
            var total = user[token].amount + raisePrice;
            try {
                await axios.post(
                    process.env.PLATFORM_SERVER + "api/games/bet",
                    {
                        token: user[token].userToken,
                        amount: user[token].betAmount + user[token].raiseAmount,
                    }
                );
            } catch (err) {
                throw new Error("Bet Error!");
            }
            try {
                await axios.post(
                    process.env.PLATFORM_SERVER + "api/games/winlose",
                    {
                        token: user[token].userToken,
                        amount: raisePrice,
                        winState: raisePrice != 0 ? true : false,
                    }
                )
            } catch (err) {
                throw new Error("WinLose Error!");
            }
            try {
                res.json({
                    msg: msg,
                    total: total,
                    raisePrice: raisePrice,
                    cases: response,
                    serverMsg: "Success"
                })
            } catch (error) {
                throw new Error("Can't find Server!");
            };
        } catch (err) {
            res.json({
                serverMsg: err.message
            })
        }
    },
};