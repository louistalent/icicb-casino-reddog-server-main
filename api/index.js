const express = require("express");
const router = express.Router();
const User = require("./api_controller");

module.exports = (router) => {
    // User API
    router.post("/CardOder", User.CardOder);
    router.post("/bet-redDog", User.BetRedDog);
    router.post("/result", User.Result);
};
