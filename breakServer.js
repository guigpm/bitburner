import { deploy, getMaxThreadsFromScript, growCondition, weakenCondition } from './lib.js';
import { log, logLevel } from './log.js';

/** @param {import("./NameSpace").NS} nameSpace */
export async function main(ns) {
  log.logLevel = logLevel.error;
  ns.disableLog("sleep");
  const executer = ns.args[0];
  const target = ns.args[1];
  if (executer != "home") {
    await deploy(ns, executer);
  }
  await deploy(ns, target);

  const weakThreads = getMaxThreadsFromScript(ns, executer, "weak.js");
  const growThreads = getMaxThreadsFromScript(ns, executer, "grow.js");
  const harvestThreads = 1;

  let pid = 0;
  log.info(ns, `Breaking server ${target} on ${executer}`);
  while (true) {
    if (weakenCondition(ns, target)) {
      log.debug(ns, "Weak " + target);
      if (weakThreads) {
        pid = ns.exec("weak.js", executer, weakThreads, target);
      } else {
        log.error(ns, `Can't weak on ${executer}. Probably no RAM.`);
        break;
      }
    } else if (growCondition(ns, target)) {
      log.debug(ns, "Grow " + target);
      if (growThreads) {
        pid = ns.exec("grow.js", executer, growThreads, target);
      } else {
        log.error(ns, `Can't grow on ${executer}. Probably no RAM.`);
        break;
      }
    } else {
      log.debug(ns, "Harvest " + target);
      if (harvestThreads) {
        pid = ns.exec("harvest.js", target, harvestThreads, target);
      } else {
        log.error(ns, `Can't harvest on ${target}. Probably no RAM.`);
      }
      break;
    }
    while (pid && ns.isRunning(pid, executer)) {
      await ns.sleep(500);
    }
  }
}
