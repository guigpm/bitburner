import { deploy, getMaxThreadsFromScript, growCondition, weakenCondition } from './lib.js';
import { log, logLevel } from './log.js';

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  log.logLevel = logLevel.trace;
  ns.disableLog("sleep");
  const executer = ns.args[0];
  const target = ns.args[1];
  if (executer != "home") {
    await deploy(ns, executer);
  }
  await deploy(ns, target);

  const weakThreads = getMaxThreadsFromScript(ns, executer, "weak.js");
  const growThreads = getMaxThreadsFromScript(ns, executer, "grow.js");
  const harvestThreads = getMaxThreadsFromScript(ns, target, "harvest.js");
  const harvestRunning = ns.isRunning("harvest.js", target, target);
  let pid = 0, stop = false;

  if (harvestRunning) {
    log.info(ns, `Already running 'harvest.js' on ${target}.`);
  } else if (harvestThreads) {
    pid = ns.exec("harvest.js", target, 1 /* Thread */, target);
    log.trace(ns, `Started 'harvest.js' on ${target} with PID=<${pid ?? 'NULL'}>.`)
  } else {
    log.error(ns, `Can't start 'harvest.js' on ${target}. Probably no RAM.`);
  }

  log.info(ns, `Breaking server ${target} on ${executer}`);
  while (!stop) {
    if (weakenCondition(ns, target)) {
      log.debug(ns, `Weak ${target} on ${executer}`);
      if (weakThreads) {
        pid = ns.exec("weak.js", executer, weakThreads, target);
      } else {
        log.error(ns, `Can't weak on ${executer}. Probably no RAM.`);
        break;
      }
    } else if (growCondition(ns, target)) {
      log.debug(ns, `Grow ${target} on ${executer}`);
      if (growThreads) {
        pid = ns.exec("grow.js", executer, growThreads, target);
      } else {
        log.error(ns, `Can't grow on ${executer}. Probably no RAM.`);
        break;
      }
    } else {
      log.debug(ns, `Harvest ${target} on ${executer}`);
      if (harvestRunning || harvestThreads) {
        break;
      } else {
        pid = ns.exec("hack.js", executer, getMaxThreadsFromScript(ns, executer, "hack.js"), target);
        log.info(ns, `Hacking on ${executer}.`);
        stop = true;
      }
    }
    while (pid && ns.isRunning(pid, executer)) {
      await ns.sleep(500);
    }
  }
}
