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

  alreadyRunning && log.info(ns, "is already being hacked", target);
  !moneyAvailable && log.info(ns, "has no money", target);
  !rootAccess && log.info(ns, "doesnt have root access", target);
  !hackLevel && log.info(ns, "hack level is above mine", target);

  return !alreadyRunning && moneyAvailable && rootAccess && hackLevel;
}

export class Queue {
  constructor() {
    this.elements = {};
    this.head = 0;
    this.tail = 0;
  }
  enqueue(element) {
    this.elements[this.tail] = element;
    this.tail++;
  }
  enqueueMany(listOfElements) {
    for (const element of listOfElements) {
      this.enqueue(element);
    }
  }
  dequeue() {
    const item = this.elements[this.head];
    delete this.elements[this.head];
    this.head++;
    return item;
  }
  peek() {
    return this.elements[this.head];
  }
  get length() {
    return this.tail - this.head;
  }
  get isEmpty() {
    return this.length === 0;
  }
}

export function Lib() {};