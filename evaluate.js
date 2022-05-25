import {
    canBeHacked,
    serversWithinDistance,
    weakenCondition,
    growCondition,
    getMoneyThreshold,
    formatMoney,
    getThreadsByRam,
    getSecurityThreshold,
    thresholds
} from "./lib";
import { log, logLevel } from "./log";

class ServerRow {
    /** @param {import("./NameSpace").NS} ns */
    constructor(ns, server, player, availableMemoryGb) {
        this.ns = ns;
        this.server = server;
        this.hackable = canBeHacked(ns, server.hostname, "", false);
        this.broken = !weakenCondition(ns, server.hostname) && !growCondition(ns, server.hostname)
        this.growth = server.serverGrowth;
        this.hackTimeInSeconds = ns.formulas.hacking.hackTime(server, player) / 1000;
        this.growTimeInSeconds = ns.formulas.hacking.growTime(server, player) / 1000;
        this.weakTimeInSeconds = ns.formulas.hacking.weakenTime(server, player) / 1000;
        this.hgwTimeInSeconds = this.hackTimeInSeconds + this.growTimeInSeconds + this.weakTimeInSeconds;

        this.hackAmountPercentage = ns.formulas.hacking.hackPercent(server, player);
        this.hackThreads = this.hackAmountPercentage == 0 ? 0 : Math.ceil(thresholds.money / this.hackAmountPercentage);
        this.hackSuccessRate = ns.formulas.hacking.hackChance(server, player);
        this.targetMoney = getMoneyThreshold(ns, server.hostname);

        this.targetSecurityLevel = getSecurityThreshold(ns, server.hostname);
        this.moneyPerHack = this.targetMoney * this.hackAmountPercentage * this.hackThreads;
        this.avgMoneyPerHack = this.moneyPerHack * this.hackSuccessRate;

        this.growTimeAfterHack = this.growingTime(this.targetMoney - this.moneyPerHack, availableMemoryGb);
        this.growTimeUntilBreak = this.growingTime(this.server.moneyAvailable, availableMemoryGb);
        this.growThreadsAfterHack = this.growThreads(this.targetMoney - this.moneyPerHack);

        const securityIncreaseAfterHack = ns.growthAnalyzeSecurity(this.growThreads(this.targetMoney - this.moneyPerHack));
        this.weakTimeAfterHack = this.weakenTime(this.targetSecurityLevel + securityIncreaseAfterHack, availableMemoryGb);
        this.weakTimeUntilBreak = this.weakenTime(this.server.hackDifficulty, availableMemoryGb);
        this.weakThreadsAfterHack = this.weakThreads(this.targetSecurityLevel + securityIncreaseAfterHack);

        this.breakTime = this.growTimeUntilBreak + this.weakTimeUntilBreak;
        this.totalThreads = this.weakThreadsAfterHack + this.growThreadsAfterHack + this.hackThreads
    }
    growThreads(initialMoney) {
        const growthMultiplier = this.targetMoney / (initialMoney == 0 ? 1 : initialMoney)
        if (isNaN(growthMultiplier)) return Infinity;
        if (growthMultiplier < 1) {
            return 0;
        }
        return Math.ceil(this.ns.growthAnalyze(this.server.hostname, growthMultiplier));
    }
    growingTime(initialMoney, memoryToBreakGb) {
        const growThreads = this.growThreads(initialMoney);
        const availableThreads = getThreadsByRam(memoryToBreakGb, 1.75);
        const requiredGrows = Math.ceil(growThreads / availableThreads);
        return requiredGrows * this.growTimeInSeconds;
    }
    weakThreads(initialSecurityLevel) {
        if (this.targetSecurityLevel > initialSecurityLevel) {
            return 0;
        }
        const levelDecreasePerWeaken = this.ns.weakenAnalyze(1);
        return Math.ceil((initialSecurityLevel - this.targetSecurityLevel) / levelDecreasePerWeaken);
    }
    weakenTime(initialSecurityLevel, memoryToBreakGb) {
        const weakensWithSingleThread = this.weakThreads(initialSecurityLevel);
        const availableThreads = getThreadsByRam(memoryToBreakGb, 1.75);
        const weakensWithAllAvailableThreads = Math.ceil(weakensWithSingleThread / availableThreads);
        return weakensWithAllAvailableThreads * this.weakTimeInSeconds;
    }

    print(number, paddings) {
        const hackable = this.hackable ? "✓" : "X";
        const broken = this.broken ? "✓" : "X";
        const values = [number,
            hackable,
            broken,
            this.server.hostname,
            this.growth,
            sprintf("%d", this.weakThreadsAfterHack),
            sprintf("%d", this.growThreadsAfterHack),
            sprintf("%d", this.hackThreads),
            sprintf("%d", this.totalThreads),
            sprintf("%.1fTb", (this.totalThreads * 1.75) / 1024),
            Math.round(this.weakTimeInSeconds) + "s",
            Math.round(this.growTimeInSeconds) + "s",
            Math.round(this.hackTimeInSeconds) + "s",
            Math.round(this.hgwTimeInSeconds) + "s",
            formatMoney(this.ns, this.moneyPerHack),
            sprintf("%.1f", this.hackSuccessRate * 100),
            formatMoney(this.ns, this.avgMoneyPerHack),
            sprintf("%.1fs", this.growTimeAfterHack),
            sprintf("%.1fs", this.growTimeUntilBreak),
            sprintf("%.1fs", this.weakTimeAfterHack),
            sprintf("%.1fs", this.weakTimeUntilBreak),
            sprintf("%.1fs", this.breakTime),
        ]
        return values
            .map((value, index) => value.toString().padStart(paddings[index]))
            .join("");
    }
}

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
    log.logLevel = logLevel.debug;
    const maxDistance = ns.args.length == 1 ? ns.args[0] : 1;
    const servers = serversWithinDistance(ns, maxDistance)
        .filter(server => !server.startsWith("home"))
        .map((server) => ns.getServer(server));

    const paddings = [5, 5, 8, 20, 7, 7, 7, 7, 10, 10, 7, 7, 7, 7, 13, 10, 13, 13, 13, 13, 13, 13];
    const header = "# CBH Broken name grow WT GT HT TT TMem W G H WGH $/H H/100 avg$/H GTAH GTUB WTAH WTUB BT"
        .split(" ")
        .map((header, index) => header.padStart(paddings[index]))
        .join('');
    let separator = [];
    for (var i = 0; i < header.length; i++)
        separator.push("-");
    separator = separator.join("")
    const player = ns.getPlayer();
    // player.hacking = 1000; // Simulate different hacking levels
    const rows = servers.map(server => new ServerRow(ns, server, player, 25 * 1 * 1024));
    rows.sort((a, b) => (a.avgMoneyPerHack - b.avgMoneyPerHack) * -1);
    ns.tprintf(header);
    ns.tprintf(separator);

    for (const [i, row] of rows.entries()) {
        ns.tprintf(row.print(i + 1, paddings));
    }
}