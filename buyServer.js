import { formatMoney } from "./lib";
import { logLevel } from "./log";
import { Context } from "./context";


export async function main(ns) {
    const ctx = new Context(ns);
    ctx.log.logLevel = logLevel.debug;
    if (![2, 3].includes(ctx.ns.args.length)) {
        ctx.log.fatal("Usage: <HostName> <RAM in GB|Max> <amount>");
    }
    const hostName = ctx.ns.args[0];
    let ram = ctx.ns.args[1];
    const amount = ctx.ns.args[2] ?? 1;

    const maxRam = 1048576; // 1024 Tb
    const ramString = `${ram}`.toLowerCase();
    if (ramString === 'max') {
        ram = maxRam;
    } else if (ramString.endsWith('t') || ramString.endsWith('tb')) {
        ram = ramString.replace('tb', '').replace('t', '') * 1024;
        ctx.log.debug(`Ram ${ramString.toUpperCase()} => ${ram}GB`);
    }
    if (ram > 1048576) {
        ctx.log.fatal(`Max RAM size option is '${maxRam}'GB (or use 'Max' string).`);
    }

    const newServerCost = formatMoney(ctx.ns, ctx.ns.getPurchasedServerCost(ram));
    for (let i = 0; i < amount; i++) {
        const newHostName = ctx.ns.purchaseServer(hostName, ram);
        if (newHostName.length) {
            ctx.log.debug(`Server '${newHostName}' purchased. Paid ${newServerCost}`);
        } else {
            ctx.log.error(`No money to buy a server with '${ram}GB' RAM. Needs ${newServerCost}`);
        }
    }
}