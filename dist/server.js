"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateServer = void 0;
var express_1 = require("express");
var CreateServer = function () {
    var app = (0, express_1.default)();
    app.disable("x-powered-by");
    return app;
};
exports.CreateServer = CreateServer;
