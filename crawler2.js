import {
    deploy,
    serversWithinDistance,
    getMaxThreadsFromScript,
} from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";
import { Invade } from "./invade";
import { Process } from "./process";

/**
 * @param {Context} ctx 
 * @param {string} target
 */
async function own(ctx, target) {
    ctx.log.info(`Gaining Root Access on ${target}`);
    const invade = new Invade(ctx, target);
    if (invade.openPorts()) {
        invade.gainRootAccess();
        ctx.log.info(`Server ${target} owned`);
    } else {
        ctx.log.error(`Can't open ports on ${target}`);
    }
}

/**
 * @param {Context} ctx 
 * @param {string} target
 * @returns {Process}
 */
export async function startHack(ctx, target) {
    ctx.log.trace(`Start harvest on ${target}`);
    const threads = getMaxThreadsFromScript(ctx.ns, target, "harvest.js");
    if (threads) {
        return new Process(ctx, "harvest.js", target).start(target, 1);
    } else if (ctx.ns.getServerMaxRam(target) <= 4 && ctx.ns.getServerMaxRam(target) >= 2) {
        return new Process(ctx, "cheapHarvest.js", target).start(target, 1);
    } else {
        ctx.log.warning(`Can't run harvest|cheapHarvest on ${target}. No RAM.`);
    }
}

/**
 * @param {Context} ctx 
 * @param {string} target
 */
async function killall_target(ctx, target) {
    ctx.log.info(`Killing all process on ${target}`);
    ctx.ns.killall(target);
    ctx.log.debug(`Deleted ${ctx.ns.getScriptName()} on ${target}`);
}

export async function main(ns) {
    const ctx = new Context(ns);
    ctx.log.logLevel = logLevel.warning;
    if (ctx.ns.args.length != 1) {
        ctx.log.fatal("Usage: HACK|KILLALL|DEPLOY");
        ctx.ns.exit(1);
    }

    const operation = ctx.ns.args[0].toLowerCase();
    const adjacents = serversWithinDistance(ctx.ns).filter(
        adjacent => !adjacent.startsWith("home-")
            && adjacent != "home"
            && adjacent != ctx.ns.getHostname()
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
        // Prevents UI freeze
        await ctx.ns.sleep(100);
    }
    ctx.log.debug(`Last line of ${ctx.ns.getScriptName()}`);
}
