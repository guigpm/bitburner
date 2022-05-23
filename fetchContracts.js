import { Queue } from "./queue";
/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
    const visited = [];
    const contracts = [];
    const queue = new Queue();
    queue.enqueue("home");

    // while (!queue.isEmpty) {
    //     const current = queue.dequeue();
    //     visited.push(current);

    //     const contracts = ns.ls(current, ".cct");
    //     for (const contract of contracts) {
    //         contracts.push({ "server": current, "contract": contract });
    //     }

    //     const adjacents = ns.scan(current);
    //     for (const adjacent of adjacents) {
    //         if (!visited.includes(adjacent)) {
    //             queue.enqueue(adjacent);
    //         }
    //     }
    // }
    ns.tprint(contracts);
    return contracts
}