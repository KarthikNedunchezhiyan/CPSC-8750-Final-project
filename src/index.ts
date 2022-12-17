import {CreateServer} from "./server";
import * as http from "http";
import {AddressInfo} from "net";

const app_name: string = "Placement Manager";
const host: string = process.env.HOST || "0.0.0.0";
const port: number = parseInt(process.env.PORT || "3097");
const signal_traps: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

const startServer = async () => {
    const app = await CreateServer(host, port);
    const server = http.createServer(app).listen({host, port}, () => {
        const listen_address: AddressInfo = server.address() as AddressInfo;
        console.log(`${app_name} is running at http://${listen_address.address}:${listen_address.port}`);
    });

    // Signal traps
    signal_traps.forEach(signal => {
        process.once(signal, async () => {
            console.log(`received signal ${signal}`);
            console.log(`closing ${app_name}`);
            server.close(() => {
                console.log(`${app_name} closed`);
            });
        });
    });
}

startServer();
