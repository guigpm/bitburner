import { deploy, getMaxThreadsFromScript, getMoneyThreshold, getSecurityThreshold, growCondition, weakenCondition } from './lib.js';
import { log } from './log.js';

/** @param {import("./NameSpace").NS} nameSpace */
export async function main(ns) {
  ns.disableLog("sleep");
  const executer = ns.args[0];
  const target = ns.args[1];
  await deploy(ns, executer);
  await deploy(ns, target);

  const weakThreads = getMaxThreadsFromScript(ns, target, "weak.js");
  const growThreads = getMaxThreadsFromScript(ns, target, "grow.js");
  const harvestThreads = 1;

  let pid = 0;
  log.info(ns, `Breaking server ${target} on ${executer}`);
  while (true) {
    if (weakenCondition(ns, target)) {
      log.debug(ns, "Weak " + target)
      pid = ns.exec("weak.js", executer, weakThreads, target);
    } else if (growCondition(ns, target)) {
      log.debug(ns, "Grow " + target)
      pid = ns.exec("grow.js", executer, growThreads, target);
    } else {
      log.debug(ns, "Harvest " + target)
      pid = ns.exec("harvest.js", target, harvestThreads, target);
      break;
    }
    while (ns.isRunning(pid, executer)) {
      await ns.sleep(500);
    }
  }
}
