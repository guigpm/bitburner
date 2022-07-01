import { logLevel } from "./log";
import { Context } from "./context";

export async function main(ns) {
    const ctx = new Context(ns);
    ctx.log.logLevel = logLevel.debug;
    if (ctx.ns.args.length != 1) {
        ctx.log.fatal("Usage: <target>");
        ctx.ns.exit(1);
    }

    const prefix = ctx.ns.args[0];
    const targets = ctx.ns.scan().filter(server => server.startsWith(prefix) && server != "home");
    for (const target of targets) {
        const deleted = ctx.ns.deleteServer(target);
        if (deleted) {
            ctx.ns.alert(`Server '${target}' deleted.`);
            ctx.log.debug(`Server '${target}' deleted.`);
        }
        else {
            ctx.log.debug(`Server ${target} was NOT deleted. Probably running a script.`);
        }
    }
}