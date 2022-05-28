import { Queue } from './queue.js';

/**
 * @param {import("./context").Context} ctx
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
  queue.enqueue({ "name": ns.getHostname(), "distance": 1 })

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

export class Lib { }
