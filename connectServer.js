import { Context } from "./context";
import { BreadthFirstSearch } from "./traversal";
import { InvasionTarget } from "./invade";


export async function main(ns) {
    const ctx = new Context(ns);

    const target = ctx.ns.args[0]

    if (target === "darkweb") {
        ctx.ns.singularity.purchaseTor();
        ctx.ns.singularity.connect(target);
        return;
    }
    const path = new BreadthFirstSearch(ctx).pathToTarget(target);

    for (const segment of path) {
        const targetObject = new InvasionTarget(ctx, segment);
        targetObject.connect();

        if (segment == path[path.length - 1]) {
            targetObject.own();
            await targetObject.backdoor();
        }
    }
}