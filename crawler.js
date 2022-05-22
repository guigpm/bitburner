import { waitTargetPid, deploy } from './lib.js';
import { log, logLevel } from './log.js';

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function spread(ns, target) {
  // if (ns.isRunning(ns.getScriptName(), target, ns.args[0])) {
  if (ns.fileExists("crawler_exec.txt", target)) {
    log.info(ns, `Skipping Spread on ${target}`);
    return;
  }
  log.info(ns, `Starting ${ns.getScriptName()} on ${target}`);
  const pid = ns.exec(ns.getScriptName(), target, 1, ns.args[0]);
  if (pid == 0) {
    log.warning(ns, `Script ${ns.getScriptName()} didn't start on ${target}, probably not enough RAM`);
    return;
  }
  await ns.sleep(1500);
  await waitTargetPid(ns, pid, target);
  log.debug(ns, `Finished executing ${ns.getScriptName()} on ${target}`);
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 */
async function own(ns, target) {
  log.info(ns, `Gaining Root Access on ${target}`);
  const portsRequired = ns.getServerNumPortsRequired(target);
  if (portsRequired > 2) {
    log.debug(ns, `${target} is too hard!`);
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

  const operation = ns.args[0];
  const adjacents = ns.scan().filter(adjacent => !adjacent.startsWith("home-") && adjacent != "home");
  await ns.write("crawler_exec.txt");
  log.debug(ns, adjacents);
  for (var i = 0; i < adjacents.length; i++) {
    const target = adjacents[i];
    await own(ns, target);
    await deploy(ns, target);
    if (operation.toLowerCase() == "hack") {
      await spread(ns, target);
      await startHack(ns, target);
    } else if (operation.toLowerCase() == "killall") {
      await killall_target(ns, target);
      await spread(ns, target);
    } else if (operation.toLowerCase() == "deploy") {
      await spread(ns, target);
    } else {

    }
  }
  ns.rm("crawler_exec.txt");
  log.debug(ns, `Last line of ${ns.getScriptName()}`);
}