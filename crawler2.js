import { waitTargetPid, deploy, openPorts, serversWithinDistance, canBeHacked } from './lib.js';
import { log, logLevel } from './log.js';

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function own(ns, target) {
    log.info(ns, `Gaining Root Access on ${target}`);
    if (openPorts(ns, target)) {
        ns.nuke(target);
        log.info(ns, `Server ${target} owned`);
    } else {
        log.error(ns, `Can't open ports on ${target}`);
    }
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function startHack(ns, target) {
    log.info(ns, `Start harvest on ${target}`);
    const availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target)
    const harvestRam = ns.getScriptRam("harvest.js");
    const threads = Math.floor(availableRam / harvestRam);
    if (threads) {
        const pid = ns.exec("harvest.js", target, 1, target);
        if (pid == 0) {
            log.warning(ns, `Failed to start harvest.js on ${target}. Probably no RAM.`);
        }
    } else {
        log.error(ns, `${target} has no available RAM.`);
    }
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function killall_target(ns, target) {
    log.info(ns, `Killing all process on ${target}`);
    ns.killall(target);
    log.debug(ns, `Deleted ${ns.getScriptName()} on ${target}`);
}

/**
 * @param {import("./NameSpace").NS} ns
 */
export async function main(ns) {
    log.logLevel = logLevel.debug;
    if (ns.args.length != 1) {
        log.fatal(ns, "Usage: HACK|KILLALL|DEPLOY");
        ns.exit(1);
    }

    const operation = ns.args[0].toLowerCase();
    const adjacents = serversWithinDistance(ns, 10).filter(
        adjacent => !adjacent.startsWith("home-") && adjacent != "home"
    );
    log.debug(ns, adjacents);
    for (const target of adjacents) {
        await own(ns, target);
        await deploy(ns, target);
        if (operation == "hack") {
            await startHack(ns, target);
        } else if (operation == "killall") {
            await killall_target(ns, target);
        } else if (operation == "deploy") {
            continue;
        } else {
        }
    }
    log.debug(ns, `Last line of ${ns.getScriptName()}`);
}