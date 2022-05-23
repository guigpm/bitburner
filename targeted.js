import { canBeHacked, disableFunctionLog, serversWithinDistance } from './lib.js';
import { log, logLevel } from './log.js';


/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {

  let executerServerNames = ["home-"];
  if (ns.args.length > 0) {
    executerServerNames = ns.args;
  }

  disableFunctionLog(ns, "sleep");

  log.logLevel = logLevel.debug;

  const servers = serversWithinDistance(ns, 10);
  let pids = [];

  /** @param {string} server */
  const filterExecuters = (server) => {
    return executerServerNames.filter((executer) => server.startsWith(executer));
  }

  const activeExecuters = servers.filter((server) => filterExecuters(server).length > 0);
  const targets = servers.filter((server) => server !== "home" && filterExecuters(server).length == 0);
  log.info(ns, `Targets: ${targets.toString()}`);
  for (const target of targets) {
    while (activeExecuters.length == 0) {
      for (const pidItem of pids) {
        if (pidItem.active && !ns.isRunning(pidItem.pid)) {
          activeExecuters.push(pidItem.executer);
          pidItem.active = false;
        }
      }
      await ns.sleep(1000);
    }
    if (canBeHacked(ns, target)) {
      const executer = activeExecuters.pop();
      const pid = ns.run("breakServer.js", 1, executer, target);
      pids.push({ "pid": pid, "executer": executer, "active": true });
    }
  }
  log.info(ns, "Last line of " + ns.getScriptName());
}
