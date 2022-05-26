import { Context } from './context.js';
import { Queue } from './queue.js';

/**
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
 * @param {string} hostName [optional]
 */
export async function deploy(ctx, target, hostName = undefined) {
  ctx.log.trace(`Deleting old scripts from ${target}`, hostName ?? ctx.ns.getHostname());
  const targetSources = ctx.ns.ls(target, '.js');
  for (const file of targetSources) {
    ctx.ns.rm(file, target);
  }
  ctx.log.trace(`Copying scripts to ${target}`, hostName ?? ctx.ns.getHostname());
  const sources = ctx.ns.ls(hostName ?? ctx.ns.getHostname(), '.js');
  ctx.log.debug(sources);
  for (const file of sources) {
    await ctx.ns.scp(file, target);
  }
}

/**
 * @remarks RAM cost 0.4 GB
 * 
 * @param {Context} ns
 * @param {string} target Defines the "target server"
 * @param {script} scriptRunning [optional]
 * @param {boolean} validateRunning [optional]
 */
export function canBeHacked(ctx, target, scriptRunning = 'harvest.js', validateRunning = true) {
  const alreadyRunning = validateRunning && ctx.ns.isRunning(scriptRunning, target, target);
  const moneyAvailable = ctx.ns.getServerMoneyAvailable(target) > 0;
  const rootAccess = ctx.ns.hasRootAccess(target);
  const hackLevel = ctx.ns.getServerRequiredHackingLevel(target) <= ctx.ns.getHackingLevel();

  let reasons = "";
  if (alreadyRunning) reasons += "already being hacked";
  if (!moneyAvailable) reasons += (reasons.length ? ' / ' : '') + "no money";
  if (!rootAccess) reasons += (reasons.length ? ' / ' : '') + "no root access";
  if (!hackLevel) reasons += (reasons.length ? ' / ' : '') + "player hack level too low";

  if (reasons.length > 0) ctx.log.info(`Cannot hack ${target}: ${reasons}`);

  return !alreadyRunning && moneyAvailable && rootAccess && hackLevel;
}

/**
 * 
 * @remarks RAM cost: 0.45 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
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
 * @returns {string[]}
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

export const thresholds = {
  'money': 0.90,
  'security': 5,
};

/**
 * Defines how much money a server should have before we hack it
 * In this case, it is set to 90% of the server's max money
 * 
 * @remarks RAM cost 0.1 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
 * @returns {number}
 */
export function getMoneyThreshold(ns, target) {
  return ns.getServerMaxMoney(target) * thresholds.money;
}

/**
 * Defines the maximum security level the target server can
 * have. If the target's security level is higher than this,
 * we'll weaken it before doing anything else
 * 
 * @remarks RAM cost 0.1 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
 * @returns {number}
 */
export function getSecurityThreshold(ns, target) {
  return ns.getServerMinSecurityLevel(target) + thresholds.security;
}

/**
 * 
 * @remarks RAM cost 0.2 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
 * @returns {boolean}
 */
export function weakenCondition(ns, target) {
  return ns.getServerSecurityLevel(target) > getSecurityThreshold(ns, target);
}

/**
 * 
 * @remarks RAM cost 0.3 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
 * @returns {boolean}
 */
export function growCondition(ns, target) {
  return ns.getServerMoneyAvailable(target) < getMoneyThreshold(ns, target)
    && ns.getServerGrowth(target) > 0;
}

/**
 * 
 * @remarks RAM cost 0.1 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
 * @returns {number}
 */
export function getAvailableRam(ns, target) {
  return ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
}

/**
 * 
 * @remarks RAM cost 0.1 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
 * @param {number} ramUsage [optional] value in GB
 * @param {number} ramRemainingOnHome [optional] value in GB
 * @returns {number}
 */
export function getMaxThreads(ns, target, ramUsage = 0, ramRemainingOnHome = 32) {
  if (ramUsage == 0) {
    ramUsage = 1;
  }
  return Math.floor((
    getAvailableRam(ns, target) - ('home' === target ? ramRemainingOnHome : 0)
  ) / ramUsage);
}

/**
 * 
 * @remarks RAM cost 0.1 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {number} availableRam Available RAM in GB
 * @param {number} ramUsage [optional] value in GB
 * @returns {number}
 */
export function getThreadsByRam(availableRam, ramUsage = 0) {
  if (ramUsage == 0) {
    ramUsage = 1;
  }
  return Math.floor(availableRam / ramUsage);
}

/**
 * 
 * @remarks RAM cost 0.2 GB
 * 
 * @param {import("./NameSpace").NS} ns
 * @param {string} target Defines the "target server"
 * @param {script} script
 * @param {number} ramRemainingOnHome [optional] value in GB
 * @returns {number}
 */
export function getMaxThreadsFromScript(ns, target, script, ramRemainingOnHome = 32) {
  const scriptRam = ns.getScriptRam(script);
  return getMaxThreads(ns, target, scriptRam, ramRemainingOnHome);
}

/** 
 * @param {import("./NameSpace").NS} ns  
 * @param {number} value 
 * @returns {string}
 */
export function formatMoney(ns, value) {
  return ns.nFormat(value, '$0.000a');
}

export function Lib() { };
