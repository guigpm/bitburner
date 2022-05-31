import { formatMoney } from "./lib.js";
import { Context } from "./context";

function partial(fn, ...fnArgs) {
    return () => {
        return fn(...fnArgs)
    }
}

function compareCost(a1, a2) {
    if (a1 === null) return a2;
    if (a2 === null) return a1;
    if (a1.cost <= a2.cost) return a1;
    return a2;
}

function buildAction(ctx, cost, action, log) {
    return {
        "cost": cost,
        "action": action,
        "log": sprintf("%s: %s", log, formatMoney(ctx.ns, cost))
    }
}

function parseInputMoney(text) {
    let multiplier = 1;
    if (text.endsWith("k")) {
        multiplier = 1000;
    } else if (text.endsWith("m")) {
        multiplier = 1000000;
    } else if (text.endsWith("b")) {
        multiplier = 1000000000;
    } else if (text.endsWith("t")) {
        multiplier = 1000000000000;
    }
    if (Number.isInteger(text[text.length - 1])) {
        return text * multiplier;
    }
    return text.substring(0, text.length - 1) * multiplier;
}

export async function main(ns) {
    const ctx = new Context(ns);
    const minMoney = ctx.ns.args.length == 0 ? 0 : parseInputMoney(ctx.ns.args[0]);
    while (true) {
        const actions = [];
        if (ctx.ns.hacknet.numNodes() < ctx.ns.hacknet.maxNumNodes()) {
            actions.push(buildAction(ctx, ctx.ns.hacknet.getPurchaseNodeCost(), partial(ctx.ns.hacknet.purchaseNode), "New node"));
        }
        for (let node = 0; node < ctx.ns.hacknet.numNodes(); node++) {
            actions.push(buildAction(ctx, ctx.ns.hacknet.getLevelUpgradeCost(node, 1), partial(ctx.ns.hacknet.upgradeLevel, node, 1), `New level on hacknet-node-${node}`));
            actions.push(buildAction(ctx, ctx.ns.hacknet.getRamUpgradeCost(node, 1), partial(ctx.ns.hacknet.upgradeRam, node, 1), `New RAM on hacknet-node-${node}`));
            actions.push(buildAction(ctx, ctx.ns.hacknet.getCoreUpgradeCost(node, 1), partial(ctx.ns.hacknet.upgradeCore, node, 1), `New core on hacknet-node-${node}`));
        }
        const bestAction = actions.reduce((accumlator, action) => compareCost(accumlator, action), null);
        if (bestAction === null) ctx.log.fatal("No actions to take in hacknet");
        if (bestAction.cost === Infinity) break;
        while (ctx.ns.getServerMoneyAvailable("home") <= minMoney + bestAction.cost) {
            await ctx.ns.sleep(5000);
        }
        const success = bestAction.action();
        if (success) {
            ctx.log.info(bestAction.log);
            await ctx.ns.sleep(10);
        }
    }
    ctx.log.info("All hacknet nodes are maxxed out");
}
