export class Decider {
    static pickBestNode(root_id: string, resources: any, json: any): string | null {
        // verifying root
        if (!Object.keys(json).includes(root_id)) throw new Error(`Root with ID '${root_id}' does not exit!`);

        switch (json[root_id].settings.algorithm) {
            case "0":
                return this.applyFirstFit(json[root_id].nodes, resources);
            case "1":
                return this.applyBestFit(json[root_id].nodes, resources);
            case "2":
                return this.applyWortFit(json[root_id].nodes, resources);
            default:
                throw new Error(`Algorithm '${json[root_id].settings.algorithm}' not implemented!`);
        }
    }

    private static applyFirstFit(nodes: any, resources: any): string | null {
        const nodes_name_list = Object.keys(nodes);
        for (let i = 0; i < nodes_name_list.length; ++i) {
            const node = nodes_name_list[i];
            let satisfied = true;
            Object.keys(resources).forEach(resource => {
                if (!nodes[node][resource] || nodes[node][resource].value < resources[resource]) {
                    satisfied = false;
                }
            });
            if (satisfied) return node;
        }
        return null;
    }

    private static applyWortFit(nodes: any, resources: any): string | null {
        let percentage_available: any = [];
        const nodes_name_list = Object.keys(nodes);
        for (let i = 0; i < nodes_name_list.length; ++i) {
            const node = nodes_name_list[i];
            let satisfied = true;
            let availability = 0;
            Object.keys(resources).forEach(resource => {
                if (!nodes[node][resource] || nodes[node][resource].value < resources[resource]) {
                    satisfied = false;
                } else {
                    availability += (nodes[node][resource].value - resources[resource]) * 100;
                }
            });
            if (satisfied)
                percentage_available.push([availability, node]);
        }

        if (percentage_available.length === 0) return null;

        percentage_available.sort();
        return percentage_available[0][1];
    }

    private static applyBestFit(nodes: any, resources: any): string | null {
        let percentage_available: any = [];
        const nodes_name_list = Object.keys(nodes);
        for (let i = 0; i < nodes_name_list.length; ++i) {
            const node = nodes_name_list[i];
            let satisfied = true;
            let availability = 0;
            Object.keys(resources).forEach(resource => {
                if (!nodes[node][resource] || nodes[node][resource].value < resources[resource]) {
                    satisfied = false;
                } else {
                    availability += (nodes[node][resource].value - resources[resource]) * 100;
                }
            });
            if (satisfied)
                percentage_available.push([availability, node]);
        }

        if (percentage_available.length === 0) return null;

        percentage_available.sort().reverse();
        return percentage_available[0][1];
    }
}