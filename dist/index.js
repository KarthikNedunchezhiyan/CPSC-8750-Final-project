"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
var app_name = "Placement Manager";
var host = process.env.HOST || "0.0.0.0";
var port = parseInt(process.env.PORT || "3097");
var signal_traps = ['SIGTERM', 'SIGINT'];
var startServer = function () {
    var app = (0, server_1.CreateServer)();
    // const server = http.createServer(app).listen({host, port}, () => {
    //     const listen_address: AddressInfo = server.address() as AddressInfo;
    //     console.log(`${app_name} is running at http://${listen_address.address}:${listen_address.port}`);
    // });
    //
    // // Signal traps
    // signal_traps.forEach(signal => {
    //     process.once(signal, async () => {
    //         console.log(`received signal ${signal}`);
    //         console.log(`closing ${app_name}`);
    //         server.close(() => {
    //             console.log(`${app_name} closed`);
    //         });
    //     });
    // });
};
startServer();
