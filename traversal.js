import { BaseContext } from "./base";
import { Queue } from "./queue";

export class BredthFirstSearch extends BaseContext {
    traverse(visitFn, start = "home", maxDistance = 10) {
        const queue = new Queue();
        queue.enqueue({ "name": start, "distance": 1 })
        const visited = [start];
        const results = [];

        while (!queue.isEmpty) {
            const current = queue.dequeue();
            results.push(visitFn(start, 1));

            const adjacents = ns.scan(current.name);
            if (current.distance <= maxDistance) {
                for (const adjacent of adjacents) {
                    if (!visited.includes(adjacent)) {
                        visited.push(adjacent);
                        queue.enqueue({ "name": adjacent, "distance": current.distance + 1 });
                    }
                }
            }
        }
        return results;
    }
}

/**
 * 
 * @param {Context} ctx 
 * @param {int} maxDistance [optional]
 * @returns {string[]}
 */
export function serversWithinDistance2(ctx, start = "home", maxDistance = undefined) {
    if (maxDistance == undefined) {
        if (ns.fileExists("DeepscanV2.exe", "home")) {
            maxDistance = 10;
        } else if (ns.fileExists("DeepscanV1.exe", "home")) {
            maxDistance = 5;
        } else {
            maxDistance = 3;
        }
    }
    return ctx.BredthFirstSearch((hostname, distance) => hostname, start, maxDistance);
}