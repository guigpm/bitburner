import { canBeHacked, disableFunctionLog } from './lib.js';
import { log, logLevel } from './log.js';

let activeExecuters = [];

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {

  let executerServerNames = ["home-"];
  if (ns.args.length > 0) {
    executerServerNames = ns.args;
  }

  disableFunctionLog(ns, "sleep");

  log.logLevel = logLevel.debug;

  const servers = ns.scan();
  let pids = [];

  /** @param {string} server */
  const filterExecuters = (server) => {
    return executerServerNames.filter((executer) => server.startsWith(executer));
  }

  activeExecuters = servers.filter((server) => filterExecuters(server).length > 0);
  const targets = servers.filter((server) => server !== "home" && filterExecuters(server).length == 0);
  log.info(ns, `Targets: ${targets.toString()}`, "home");
  for (var i = 0; i < targets.length; i++) {
    const target = targets[i];
    while(activeExecuters.length == 0) {
      for (var j = 0; j < pids.length; j++) {
        if (pids[j].active && !ns.isRunning(pids[j].pid)) {
          activeExecuters.push(pids[j].executer);
          pids[j].active = false;
        }
      }
      await ns.sleep(1000);
    }
    if (canBeHacked(ns, target)) {
      const executer = activeExecuters.pop();
      log.info(ns, `Will break ${target}`, executer);
      const pid = ns.run("breakServer.js", 1, executer, target);
      pids.push({"pid": pid, "executer": executer, "active": true});
    }
  }
  log.info(ns, 'Process End', "home");
}
