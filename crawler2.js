import {
    deploy,
    serversWithinDistance,
    getMaxThreadsFromScript,
} from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";

/**
 * @param {Context} ctx 
 * @param {string} target
 */
async function own(ctx, target) {
    ctx.log.info(`Gaining Root Access on ${target}`);
    const invade = ctx.Invade(target);
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
    return ctx.Process("harvest.js", target).start(target, Math.min(threads, 1));
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
    ctx.log.logLevel = logLevel.debug;
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
    }
    ctx.log.debug(`Last line of ${ctx.ns.getScriptName()}`);
}
