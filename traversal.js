import { BaseContext } from "./base";
import { Queue } from "./queue";

export class BreadthFirstSearch extends BaseContext {

    /**
     * @param {Function} visitFn ```ts
     *  (ctx: Context, hostName: string, distanceFromStart: number): any => {}
     * ```
     * @param {string} start 
     * @param {number} maxDistance 
     * @returns {any[]} Array of visitFn results
     */
    traverse(visitFn = undefined, start = "home", maxDistance = Infinity) {
        const queue = new Queue();
        queue.enqueue({ "name": start, "distance": 0 })
        const visited = [start];
        const results = [];

        while (!queue.isEmpty) {
            const current = queue.dequeue();
            if (visitFn && typeof visitFn === 'function') {
                const visitResult = visitFn(this.ctx, current.name, current.distance);
                if (visitResult != null && visitResult.length !== 0) {
                    results.push(visitResult);
                }
            } else {
                results.push(current.name);
            }
            const adjacents = this.ctx.ns.scan(current.name);
            if (current.distance <= maxDistance) {
                for (const adjacent of adjacents) {
                    if (!visited.includes(adjacent)) {
                        visited.push(adjacent);
                        queue.enqueue({ "name": adjacent, "distance": current.distance + 1 });
                    }
                }
            }
        }
        return results.flat();
    }

    /**
     * @param {string} start 
     * @param {string} target 
     * @returns {string[]} Array of shortest path between start and target
     */
    pathToTarget(target, start = "home") {
        const queue = new Queue();
        queue.enqueue({ "name": start, "path": [start] })
        const visited = [start];

        while (!queue.isEmpty) {
            const current = queue.dequeue();
            if (current.name == target) {
                return current.path.slice(1, current.path.length);
            }
            const adjacents = this.ctx.ns.scan(current.name);
            for (const adjacent of adjacents) {
                if (!visited.includes(adjacent)) {
                    visited.push(adjacent);
                    queue.enqueue({ "name": adjacent, "path": current.path.concat(adjacent) });
                }
            }
        }
        // No path found
        return []
    }
}

export class DepthFirstSearch extends BaseContext {

    /**
     * @param {Function} visitFn ```ts
     *  (ctx: Context, hostName: string, distanceFromStart: number): any => {}
     * ```
     * @param {string} start 
     * @param {number} maxDistance 
     * @returns {any[]} Array of visitFn results
     */
    traverse(visitFn = undefined, start = "home", maxDistance = Infinity) {
        const stack = [];
        stack.push({ "name": start, "distance": 0 })
        const visited = [start];
        const results = [];
        let current;
        while ((current = stack.pop())) {
            if (visitFn && typeof visitFn === 'function') {
                const visitResult = visitFn(this.ctx, current.name, current.distance);
                if (visitResult != null && visitResult.length !== 0) {
                    results.push(visitResult);
                }
            } else {
                results.push(current.name);
            }
            const adjacents = this.ctx.ns.scan(current.name);
            if (current.distance <= maxDistance) {
                for (const adjacent of adjacents) {
                    if (!visited.includes(adjacent)) {
                        visited.push(adjacent);
                        stack.push({ "name": adjacent, "distance": current.distance + 1 });
                    }
                }
            }
        }
        return results.flat();
    }
}