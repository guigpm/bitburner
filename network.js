import { Context } from "./context";
import { DepthFirstSearch } from "./traversal";

function printNetwork(ctx, hostName, distance) {
    return { "name": hostName, "distance": distance };
}

export async function main(ns) {
    const ctx = new Context(ns);
    const servers = new DepthFirstSearch(ctx).traverse(printNetwork);
    servers.forEach((server) => {
        const identation = server.distance.toString().padEnd(3) + " . ".repeat(server.distance);
        ctx.ns.tprintf(`${identation}${server.name}`);
    });
}