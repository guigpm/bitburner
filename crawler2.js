import {
    serversWithinDistance,
} from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";
import { InvasionTarget } from "./invade";

export async function main(ns) {
    const ctx = new Context(ns);
    ctx.log.logLevel = logLevel.warning;
    if (ctx.ns.args.length != 1) {
        ctx.log.fatal("Usage: HACK|KILLALL|DEPLOY");
        ctx.ns.exit(1);
    }

    const operation = ctx.ns.args[0].toLowerCase();
    const adjacents = serversWithinDistance(ctx.ns)
        .filter(
            adjacent => !adjacent.startsWith("home-")
                && adjacent != "home"
                && adjacent != ctx.ns.getHostname())
        .map((hostname) => new InvasionTarget(ctx, hostname));

    for (const target of adjacents) {
        target.own();
        await target.deploy();
        if (operation == "hack") {
            await target.startHarvest();
        } else if (operation == "killall") {
            target.killall();
        } else if (operation == "deploy") {
            continue;
        } else {
        }
        // Prevents UI freeze
        await ctx.ns.sleep(100);
    }
    ctx.log.debug(`Last line of ${ctx.ns.getScriptName()}`);
}
