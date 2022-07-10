import { formatMoney } from "./lib.js";
import { Context } from "./context";

/**
 * 
 * @param {import("./NameSpace").NodeStats} stats 
 * @returns {number}
 */
function gainFromLevelUpgrade(stats) {
    return (1 * 1.5) * Math.pow(1.035, stats.ram - 1) * ((stats.cores + 5) / 6);
}
/**
 * 
 * @param {import("./NameSpace").NodeStats} stats 
 * @returns {number}
 */
function gainFromRamUpgrade(stats) {
    return (stats.level * 1.5) * (Math.pow(1.035, (2 * stats.ram) - 1) - Math.pow(1.035, stats.ram - 1)) * ((stats.cores + 5) / 6);
}
/**
 * 
 * @param {import("./NameSpace").NodeStats} stats 
 * @returns {number}
 */
function gainFromCoreUpgrade(stats) {
    return (stats.level * 1.5) * Math.pow(1.035, stats.ram - 1) * (1 / 6);
}
/**
 * 
 * @returns {number}
 */
// New node gain is like upgrading a machine (level=0, ram=1, core=1) to (1, 1, 1)
function gainFromNewNode() {
    return gainFromLevelUpgrade({ "ram": 1, "level": 1, "cores": 1 })
}

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

function compareBreakEvenTime(a1, a2) {
    if (a1 === null) return a2;
    if (a2 === null) return a1;
    if (a1.breakEvenSeconds <= a2.breakEvenSeconds) return a1;
    return a2;
}

function buildAction(ctx, cost, action, rawGain, log) {
    const gainMultiplier = ctx.ns.getHacknetMultipliers().production * ctx.ns.getBitNodeMultipliers().HacknetNodeMoney;
    const gain = rawGain * gainMultiplier;
    const breakEvenSeconds = cost / gain;
    return {
        "gain": gainMultiplier * gain,
        "breakEvenSeconds": breakEvenSeconds,
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
    const maxBreakEventSeconds = 3600 * 1; // 1 hour
    while (true) {
        const actions = [];
        if (ctx.ns.hacknet.numNodes() < ctx.ns.hacknet.maxNumNodes()) {
            actions.push(
                buildAction(ctx,
                    ctx.ns.hacknet.getPurchaseNodeCost(),
                    partial(ctx.ns.hacknet.purchaseNode),
                    gainFromNewNode(),
                    "New node"));
        }

        for (let node = 0; node < ctx.ns.hacknet.numNodes(); node++) {
            const stats = ctx.ns.hacknet.getNodeStats(node);
            actions.push(
                buildAction(ctx,
                    ctx.ns.hacknet.getLevelUpgradeCost(node, 1),
                    partial(ctx.ns.hacknet.upgradeLevel, node, 1),
                    gainFromLevelUpgrade(stats),
                    `New level on hacknet-node-${node}`));
            actions.push(
                buildAction(ctx,
                    ctx.ns.hacknet.getRamUpgradeCost(node, 1),
                    partial(ctx.ns.hacknet.upgradeRam, node, 1),
                    gainFromRamUpgrade(stats),
                    `New RAM on hacknet-node-${node}`));
            actions.push(
                buildAction(ctx,
                    ctx.ns.hacknet.getCoreUpgradeCost(node, 1),
                    partial(ctx.ns.hacknet.upgradeCore, node, 1),
                    gainFromCoreUpgrade(stats),
                    `New core on hacknet-node-${node}`));
        }
        const bestAction = actions.reduce((accumlator, action) => compareBreakEvenTime(accumlator, action), null);
        if (bestAction === null) ctx.log.fatal("No actions to take in hacknet");
        if (bestAction.cost === Infinity) break;
        while (ctx.ns.getServerMoneyAvailable("home") <= minMoney + bestAction.cost) {
            await ctx.ns.sleep(5000);
        }
        if (bestAction.breakEvenSeconds > maxBreakEventSeconds) break;
        const success = bestAction.action();
        if (success) {
            ctx.log.info(bestAction.log + ` Sleeping ${bestAction.breakEvenSeconds} seconds`);
            await ctx.ns.sleep(bestAction.breakEvenSeconds * 1000);
        }
    }
    ctx.log.info("All hacknet nodes are maxed out");
}
