import { waitTargetPid, deploy } from './lib.js';
import { log, logLevel } from './log.js';

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function spread(ns, target) {
  log.info(ns, `Running ${ns.getScriptName()} on ${target}`, target);
  await deploy(ns, target);
  const pid = ns.exec(ns.getScriptName(), target, 1, ns.args[0]);
  await waitTargetPid(ns, pid, target);
  log.debug(ns, `Finished executing ${ns.getScriptName()} on ${target}`, target);
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function own(ns, target) {
  log.info(ns, "Gaining Root Access", target);
  const portsRequired = ns.getServerNumPortsRequired(target);
  if (portsRequired > 2) {
    log.debug(ns, `${target} is too hard!`, target);
    return;
  }

  if (portsRequired >= 2) {
    if (!ns.fileExists("FTPCrack.exe", "home")) {
      return;
    }
    ns.ftpcrack(target);
  }
  if (portsRequired >= 1) {
    if (!ns.fileExists("BruteSSH.exe", "home")) {
      return;
    }
    ns.brutessh(target);
  }
  if (portsRequired >= 0) {
    ns.nuke(target);
  }

  if (ns.fileExists(ns.getScriptName(), target)) {
    log.info(ns, "Skipping Deploy and Spread", target);
    return;
  }

  await spread(ns, target);
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function startHack(ns, target) {
  log.info(ns, `Start harvest on ${target}`, target);
  const availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target)
  const harvestRam = ns.getScriptRam("harvest.js");
  const threads = Math.floor(availableRam / harvestRam);
  if (threads) {
    ns.exec("harvest.js", target, 1, target);
  } else {
    log.error(ns, `${target} has no available RAM.`, target);
  }
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function killall_target(ns, target) {
  log.info(ns, `Killing all process on ${target}`, target);
  ns.killall(target);
  await spread(ns, target);
  ns.rm(ns.getScriptName(), target);
  log.debug(ns, `Deleted ${ns.getScriptName()} on ${target}`, target);
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

  const operation = ns.args[0];
  const adjacents = ns.scan().filter( adjacent => !adjacent.startsWith("home-") && adjacent != "home");
  log.debug(ns, adjacents, ns.getHostname());
  for(var i = 0; i < adjacents.length; i++ ) {
    const target = adjacents[i];    
    await own(ns, target);
    if (operation.toLowerCase() == "hack") {
      await startHack(ns, target);
    } else if (operation.toLowerCase() == "killall") {
      await killall_target(ns, target);
    } else if (operation.toLowerCase() == "deploy") {
      await spread(ns, target);
    } else {

    }
    log.debug(ns, "Done!", target);
  }
}