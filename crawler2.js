import { deploy, openPorts, serversWithinDistance, canBeHacked } from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";

/**
 * @param {string} target
 */
async function own(ctx, target) {
    ctx.log.info(`Gaining Root Access on ${target}`);
    if (openPorts(ctx, target)) {
        ctx.ns.nuke(target);
        ctx.log.info(`Server ${target} owned`);
    } else {
        ctx.log.error(`Can't open ports on ${target}`);
    }
}

/**
 * @param {string} target
 */
async function startHack(ctx, target) {
    ctx.log.info(`Start harvest on ${target}`);
    const availableRam = ctx.ns.getServerMaxRam(target) - ctx.ns.getServerUsedRam(target)
    const harvestRam = ctx.ns.getScriptRam("harvest.js");
    const threads = Math.floor(availableRam / harvestRam);
    if (threads) {
        const pid = ctx.ns.exec("harvest.js", target, 1, target);
        if (pid == 0) {
            ctx.log.warning(`Failed to start harvest.js on ${target}. Probably no RAM.`);
        }
    } else {
        ctx.log.error(`${target} has no available RAM.`);
    }
}

/**
 * @param {string} target
 */
async function killall_target(ctx, target) {
    ctx.log.info(`Killing all process on ${target}`);
    ns.killall(target);
    ctx.log.debug(`Deleted ${ns.getScriptName()} on ${target}`);
}

export async function main(ns) {
    const ctx = new Context(ns);
    ctx.log.logLevel = logLevel.debug;
    if (ctx.ns.args.length != 1) {
        ctx.log.fatal("Usage: HACK|KILLALL|DEPLOY");
        ctx.exit(1);
    }

    const operation = ctx.ns.args[0].toLowerCase();
    const adjacents = serversWithinDistance(ctx, 10).filter(
        adjacent => !adjacent.startsWith("home-") && adjacent != "home"
    );
    ctx.log.debug(adjacents);
    for (const target of adjacents) {
        await own(ctx, target);
        await deploy(ctx, target);
        if (operation == "hack") {
            await startHack(ctx, target);
        } else if (operation == "killall") {
            await killall_target(ctx, target);
        } else if (operation == "deploy") {
            continue;
        } else {
        }
    }
    ctx.log.debug(`Last line of ${ctx.ns.getScriptName()}`);
}