import { log } from './log.js';

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
  const sources = ns.ls(hostName ?? ns.getHostname(), '.js');
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

  alreadyRunning && log.info(ns, "is already being hacked", target);
  !moneyAvailable && log.info(ns, "has no money", target);
  !rootAccess && log.info(ns, "doesnt have root access", target);
  !hackLevel && log.info(ns, "hack level is above mine", target);

  return !alreadyRunning && moneyAvailable && rootAccess && hackLevel;
}

export function Lib() {};
