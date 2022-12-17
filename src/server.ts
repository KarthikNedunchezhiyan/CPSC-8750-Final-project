import express, {Request, Response} from "express";
import {Algorithm} from "./enum/algorithm";
import {generateUniqueId} from "./util/uuid";
import fs from "fs";
import * as Path from "path";
import {Decider} from "./Decider";

const tcpPortUsed = require('tcp-port-used');

const state_json_location: string = Path.join(__dirname, "state.json");

class State {
    json: any;

    public constructor() {
        this.json = require(state_json_location);
    }

    serialize() {
        fs.writeFileSync(state_json_location, JSON.stringify(this.json));
    }

    public createRoot(algorithm: Algorithm): string {
        console.debug(`creating the root with algorithm: ${algorithm}`);
        const ID: string = generateUniqueId();
        this.json[ID] = {settings: {algorithm: algorithm}, nodes: {}};
        this.serialize();
        return ID;
    }

    public addNode(root_id: string, resources: [string]): string {
        // verifying root
        if (!Object.keys(this.json).includes(root_id)) throw new Error(`Root with ID '${root_id}' does not exit!`);
        const ID: string = generateUniqueId();
        this.json[root_id].nodes[ID] = {};
        resources.forEach(resource => {
            this.json[root_id].nodes[ID][resource] = {value: 1, items: {}};
        });
        this.serialize();
        return ID;
    }

    public addItem(root_id: string, node_id: string, resources: any): string {
        // verifying root
        if (!Object.keys(this.json).includes(root_id)) throw new Error(`Root with ID '${root_id}' does not exit!`);
        if (!Object.keys(this.json[root_id].nodes).includes(node_id)) throw new Error(`Node with ID '${node_id}' under Root '${root_id}' does not exit!`);

        const ID: string = generateUniqueId();
        Object.keys(resources).forEach(resource => {
            if (!Object.keys(this.json[root_id].nodes[node_id]).includes(resource)) throw new Error(`Resource with name '${resource}' under Node '${node_id}' under Root '${root_id}' does not exit!`);
            this.json[root_id].nodes[node_id][resource].value -= resources[resource];
            this.json[root_id].nodes[node_id][resource].items[ID] = resources[resource];
        })

        this.serialize();
        return ID;
    }
}

export const CreateServer = (host: string, port: number): Promise<express.Application> => {
    return tcpPortUsed.waitUntilFree(port, 100, 999999999).then(() => {
        const app = express();
        app.use(express.urlencoded({extended: true}));
        app.disable("x-powered-by");
        const state = new State();

        /**
         creates the new Root.
         Parameters:  Bin packing algorithm, Over subscription percentage
         Returns   :  Root ID.
         **/
        app.post("/create-root", async (request: Request, response: Response) => {
            const ID = state.createRoot(request.body.algorithm);
            response.status(200).json({
                id: ID
            });
        });

        /**
         creates the new Node under the given Root.

         Parameters:  Root ID, Set of resources
         Returns   :  Node ID.
         **/
        app.post("/root/:root_id/add-node", async (request: Request, response: Response) => {
            const ID = state.addNode(request.params.root_id, request.body.resources);
            response.status(200).json({
                id: ID
            });
        });

        /**
         find and returns the suitable node that can handle given set of
         resources.

         Parameters:  Root ID, Set of resources
         Returns   :  (Node ID, Item ID)
         Error     :  returns (-1, -1) if there is no suitable Node in the given Root ID.
         **/
        app.post("/root/:root_id/add-item", async (request: Request, response: Response) => {
            // sanitizing input values.
            Object.keys(request.body).forEach(key => {
                request.body[key] = parseFloat(request.body[key]);
            });

            const node_id: string | null = Decider.pickBestNode(request.params.root_id, request.body, state.json);
            if (node_id === null) {
                return response.status(500).send("Node with suitable capacity not available!");
            }
            const ID = state.addItem(request.params.root_id, node_id, request.body);
            response.status(200).json({
                node_id,
                id: ID
            });
        });

        /**
         Read the current state of the cluster

         Returns : Cluster state in JSON format
         **/
        app.get("/state", async (request: Request, response: Response) => {
            response.status(200).json(state.json);
        });

        return app;
    });
}