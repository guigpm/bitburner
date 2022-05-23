import { log } from "./log.js";
import { disableFunctionLog } from "./lib.js";

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
/** @param {import("./NameSpace").NS} ns */
function formatMoney(ns, value) {
    return ns.nFormat(value, '$0.00a');
}

function buildAction(ns, cost, action, log) {
    return {
        "cost": cost,
        "action": action,
        "log": sprintf("%s: %s", log, formatMoney(ns, cost))
    }
}

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
    disableFunctionLog(ns, "sleep");
    while (true) {
        const actions = [];
        if (ns.hacknet.numNodes() < ns.hacknet.maxNumNodes()) {
            actions.push(buildAction(ns, ns.hacknet.getPurchaseNodeCost(), partial(ns.hacknet.purchaseNode), "New node"));
        }
        for (let node = 0; node < ns.hacknet.numNodes(); node++) {
            actions.push(buildAction(ns, ns.hacknet.getLevelUpgradeCost(node, 1), partial(ns.hacknet.upgradeLevel, node, 1), `New level on hacknet-node-${node}`));
            actions.push(buildAction(ns, ns.hacknet.getRamUpgradeCost(node, 1), partial(ns.hacknet.upgradeRam, node, 1), `New RAM on hacknet-node-${node}`));
            actions.push(buildAction(ns, ns.hacknet.getCoreUpgradeCost(node, 1), partial(ns.hacknet.upgradeCore, node, 1), `New core on hacknet-node-${node}`));
        }
        const bestAction = actions.reduce((accumlator, action) => compareCost(accumlator, action), null);
        if (bestAction === null) log.fatal(ns, "No actions to take in hacknet");
        bestAction.action();
        log.info(ns, bestAction.log);
        await ns.sleep(500);
    }
}
