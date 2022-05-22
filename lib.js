import { log } from './log.js';
import { Queue } from './queue.js';

/**
 * @param {import("./NameSpace").NS} ns
 * @param {int} pid
 * @param {string} target [optional]
 */
export async function waitTargetPid(ns, pid, target = undefined) {
  disableFunctionLog(ns, 'sleep');
  while (ns.isRunning(pid, target)) {
    await ns.sleep(100);
  }
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} fn
 */
export function disableFunctionLog(ns, fn) {
  if (ns.isLogEnabled(fn)) {
    ns.disableLog(fn);
  }
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} fn
 */
export function enableFunctionLog(ns, fn) {
  if (!ns.isLogEnabled(fn)) {
    ns.enableLog(fn);
  }
}

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 * @param {string} hostName [optional]
 */
export async function deploy(ns, target, hostName = undefined) {
  log.info(ns, `Deleting old scripts from ${target}`, hostName ?? ns.getHostname());
  const targetSources = ns.ls(target, '.js');
  for (const file of targetSources) {
    ns.rm(file, target);
  }
  log.info(ns, `Copying scripts to ${target}`, hostName ?? ns.getHostname());
  const sources = ns.ls(hostName ?? ns.getHostname(), '.js');
  log.debug(ns, sources);
  for (const file of sources) {
    await ns.scp(file, target);
  }
}

/**
 * @remarks RAM cost 0.4 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 * @param {string} scriptRunningName [optional]
 */
export function canBeHacked(ns, target, scriptRunningName = 'harvest.js') {
  const alreadyRunning = ns.isRunning(scriptRunningName, target, target);
  const moneyAvailable = ns.getServerMoneyAvailable(target) > 0;
  const rootAccess = ns.hasRootAccess(target);
  const hackLevel = ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel();

  let reasons = "";
  if (alreadyRunning) reasons += "already being hacked";
  if (!moneyAvailable) reasons += (reasons.length ? ' / ' : '') + "no money";
  if (!rootAccess) reasons += (reasons.length ? ' / ' : '') + "no root access";
  if (!hackLevel) reasons += (reasons.length ? ' / ' : '') + "player hack level too low";

  if (reasons.length > 0) log.info(ns, `Cannot hack ${target}: ${reasons}`);

  return !alreadyRunning && moneyAvailable && rootAccess && hackLevel;
}

/**
 * 
 * @remarks RAM cost: 0.45 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target
 * @param {int} portsRequired [optional]
 */
export function openPorts(ns, target, portsRequired = undefined) {
  if (portsRequired === undefined) {
    portsRequired = ns.getServerNumPortsRequired(target);
  }

  // BruteSSH.exe - Opens up SSH Ports.
  // FTPCrack.exe - Opens up FTP Ports.
  // relaySMTP.exe - Opens up SMTP Ports.
  // HTTPWorm.exe - Opens up HTTP Ports.
  // SQLInject.exe - Opens up SQL Ports.
  // ServerProfiler.exe - Displays detailed information about a server.
  // DeepscanV1.exe - Enables 'scan-analyze' with a depth up to 5.
  // DeepscanV2.exe - Enables 'scan-analyze' with a depth up to 10.
  // AutoLink.exe - Enables direct connect via 'scan-analyze'.

  if (portsRequired > 5) {
    return false;
  }

  if (portsRequired >= 5) {
    if (!ns.fileExists("SQLInject.exe", "home")) {
      return false;
    }
    ns.sqlinject(target);
  }
  if (portsRequired >= 4) {
    if (!ns.fileExists("HTTPWorm.exe", "home")) {
      return false;
    }
    ns.httpworm(target);
  }
  if (portsRequired >= 3) {
    if (!ns.fileExists("relaySMTP.exe", "home")) {
      return false;
    }
    ns.relaysmtp(target);
  }
  if (portsRequired >= 2) {
    if (!ns.fileExists("FTPCrack.exe", "home")) {
      return false;
    }
    ns.ftpcrack(target);
  }
  if (portsRequired >= 1) {
    if (!ns.fileExists("BruteSSH.exe", "home")) {
      return false;
    }
    ns.brutessh(target);
  }

  return true;
}

/**
 * 
 * @param {import("./NameSpace").NS} ns 
 * @param {int} maxDistance [optional]
 * @returns 
 */
export function serversWithinDistance(ns, maxDistance = undefined) {
  if (maxDistance == undefined) {
    if (ns.fileExists("DeepscanV2.exe", "home")) {
      maxDistance = 10;
    } else if (ns.fileExists("DeepscanV1.exe", "home")) {
      maxDistance = 5;
    } else {
      maxDistance = 3;
    }
  }
  const visited = [];
  const queue = new Queue();
  queue.enqueue({ "name": "home", "distance": 1 })

  while (!queue.isEmpty) {
    const current = queue.dequeue();
    visited.push(current.name);

    const adjacents = ns.scan(current.name);
    if (current.distance <= maxDistance) {
      for (const adjacent of adjacents) {
        if (!visited.includes(adjacent)) {
          queue.enqueue({ "name": adjacent, "distance": current.distance + 1 });
        }
      }
    }
  }
  return visited
}

export function Lib() { };
