import { deploy } from './lib.js';
import { log } from './log.js';

/** @param {import("./NameSpace").NS} nameSpace */
export async function main(ns) {
  ns.disableLog("sleep");
  const executer = ns.args[0];
  const target = ns.args[1];
  await deploy(ns, executer);
  await deploy(ns, target);

  var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
  var securityThresh = ns.getServerMinSecurityLevel(target) + 5;

  const availableRam = ns.getServerMaxRam(executer) - ns.getServerUsedRam(executer);
  const availableRamTarget = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
  const weakThreads = Math.floor(availableRam / ns.getScriptRam("weak.js"));
  const growThreads = Math.floor(availableRam / ns.getScriptRam("grow.js"));
  const harvestThreads = 1;

  let pid = 0;
  while (true) {
    if (ns.getServerSecurityLevel(target) > securityThresh) {
      log.info(ns, "Weak " + target, executer)
      pid = ns.exec("weak.js", executer, weakThreads, target);
    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
      log.info(ns, "Grow " + target, executer)
      pid = ns.exec("grow.js", executer, growThreads, target);
    } else {
      log.info(ns, "Harvest " + target, executer)
      pid = ns.exec("harvest.js", target, harvestThreads, target);
      break;
    }
    while (ns.isRunning(pid, executer)) {
      await ns.sleep(500);
    }
  }
}
