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

    const target = ns.args[0];
    await ns.prompt(`Are you sure to delete '${target}' server?`).then((reponse) => {
        if (reponse) {
            ns.deleteServer(target);
            ns.alert(`Server '${target}' deleted.`);
            log.debug(ns, `Server '${target}' deleted.`);
        } else {
            log.debug(ns, `Cancel server '${target}' delete.`);
        }
    });
}