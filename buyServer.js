import { formatMoney, formatRam } from "./lib";
import { logLevel } from "./log";
import { Context } from "./context";

function ramStringIntoGB(ramStr) {
    const ramString = `${ramStr}`.toLowerCase();
    let ramInGb;
    if (ramString.endsWith("t") || ramString.endsWith("tb")) {
        ramInGb = ramString.replace("tb", "").replace("t", "") * 1024;
    } else if (ramString.endsWith("g") || ramString.endsWith("gb")) {
        ramInGb = ramString.replace("gb", "").replace("g", "");
    }
    if (ramInGb > 1048576) {
        ctx.log.fatal(`Max RAM size option is "${maxRam}"GB (or use "Max" string).`);
    }
    return ramInGb
}

export async function main(ns) {
    const ctx = new Context(ns);
    ctx.log.logLevel = logLevel.debug;
    if (![2, 3].includes(ctx.ns.args.length)) {
        ctx.log.fatal("Usage: <amount> <Min RAM in GB> <Max RAM in GB> ");
    }
    let desiredMachineCount = ctx.ns.args[0] ?? ctx.maxHomeMachines
    const minRam = ramStringIntoGB(ctx.ns.args[1] ?? "32gb")
    const maxRam = ramStringIntoGB(ctx.ns.args[2] ?? "1024tb") // 1024 Tb
    let moneyAvailable = ctx.ns.getServerMoneyAvailable("home")
    const homeMachinesCount = ctx.ns.scan("home").filter((hostname) => hostname.startsWith(ctx.homeMachinePrefix)).length
    const machinesAvailable = Math.max(0, ctx.maxHomeMachines - homeMachinesCount)
    if (machinesAvailable == 0) return
    if (desiredMachineCount > machinesAvailable) {
        desiredMachineCount = machinesAvailable
    }

    let targetRam = maxRam
    while (targetRam > minRam && desiredMachineCount > 0) {
        let oneMachineCost = ctx.ns.getPurchasedServerCost(targetRam)
        let numberOfMachines = Math.min(desiredMachineCount, Math.floor(moneyAvailable / oneMachineCost))
        let cost = oneMachineCost * numberOfMachines
        for (let i = 0; i < numberOfMachines; i++) {
            ctx.ns.purchaseServer(`${ctx.homeMachinePrefix}${formatRam(targetRam)}-${i}`, targetRam)
        }
        if (numberOfMachines > 0) {
            ctx.log.debug(`Server ${ctx.homeMachinePrefix}${formatRam(targetRam)} purchased ${numberOfMachines} times. Paid ${formatMoney(ctx.ns, cost)}.`);
        }
        moneyAvailable -= cost
        desiredMachineCount -= numberOfMachines
        targetRam = targetRam / 2
    }
}