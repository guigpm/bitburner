import { log, logLevel } from "./log";

/**
 * @param {import("./NameSpace").NS} ns
 */
export async function main(ns) {
    log.logLevel = logLevel.debug;
    if (ns.args.length != 1) {
        log.fatal(ns, "Usage: <target>");
        ns.exit(1);
    }

    const prefix = ns.args[0];
    const targets = ns.scan().filter(server => server.startsWith(prefix) && server != "home");
    for (const target of targets) {
        await ns.prompt(`Are you sure to delete '${target}' server?`).then((reponse) => {
            if (reponse) {
                const deleted = ns.deleteServer(target);
                if (deleted) {
                    ns.alert(`Server '${target}' deleted.`);
                    log.debug(ns, `Server '${target}' deleted.`);
                }
                else {
                    log.debug(ns, `Server ${target} was NOT deleted. Probably running a script.`);
                }
            } else {
                log.debug(ns, `Cancel server '${target}' delete.`);
            }
        });
    }
}