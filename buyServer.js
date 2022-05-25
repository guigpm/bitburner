import { formatMoney } from "./lib";
import { log, logLevel } from "./log";

/**
 * @param {import("./NameSpace").NS} ns
 */
export async function main(ns) {
    log.logLevel = logLevel.debug;
    if (![2, 3].includes(ns.args.length)) {
        log.fatal(ns, "Usage: <HostName> <RAM in GB|Max> <amount>");
    }
    const hostName = ns.args[0];
    let ram = ns.args[1];
    const amount = ns.args[2] ?? 1;

    const maxRam = 1048576; // 1024 Tb
    const ramString = `${ram}`.toLowerCase();
    if (ramString === 'max') {
        ram = maxRam;
    } else if (ramString.endsWith('t') || ramString.endsWith('tb')) {
        ram = ramString.replace('tb', '').replace('t', '') * 1024;
        log.debug(ns, `Ram ${ramString.toUpperCase()} => ${ram}GB`);
    }
    if (ram > 1048576) {
        log.fatal(ns, `Max RAM size option is '${maxRam}'GB (or use 'Max' string).`);
    }

    const newServerCost = formatMoney(ns, ns.getPurchasedServerCost(ram));
    for (let i = 0; i < amount; i++) {
        const newHostName = ns.purchaseServer(hostName, ram);
        if (newHostName.length) {
            log.debug(ns, `Server '${newHostName}' purchased. Paid ${newServerCost}`);
        } else {
            log.error(ns, `No money to buy a server with '${ram}GB' RAM. Needs ${newServerCost}`);
        }
    }
}