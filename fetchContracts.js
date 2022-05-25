import { Queue } from "./queue";

class Contract {
    constructor(server, filename) {
        this.server = server;
        this.filename = filename;
    }
}
/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
    const visited = [];
    const foundContracts = [];
    const queue = new Queue();
    queue.enqueue("home");

    while (!queue.isEmpty) {
        const current = queue.dequeue();
        visited.push(current);

        for (const contract of ns.ls(current, ".cct")) {
            foundContracts.push(new Contract(current, contract));
        }
        const adjacents = ns.scan(current);
        for (const adjacent of adjacents) {
            if (!visited.includes(adjacent)) {
                queue.enqueue(adjacent);
            }
        }
    }
    for (const contract of foundContracts) {
        ns.tprint(contract.server + " " + contract.filename);
    }

    return foundContracts
}