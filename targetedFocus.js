import { canBeHacked, disableFunctionLog, serversWithinDistance, waitTargetPid } from './lib.js';
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
  const pids = [];

  /** @param {string} server */
  const filterExecuters = (server) => {
    return executerServerNames.filter((executer) => server.startsWith(executer));
  }

  const activeExecuters = servers.filter((server) => filterExecuters(server).length > 0);
  const targets = servers.filter((server) => server !== "home" && filterExecuters(server).length == 0);

  ns.tprint(activeExecuters);
  ns.tprint(targets);


  log.info(ns, `Targets: ${targets.toString()}`);
  for (const target of targets) {
    if (canBeHacked(ns, target)) {
      for (const executer of activeExecuters) {
        const pid = ns.run("breakServer.js", 1, executer, target);
        pids.push({ "pid": pid, "executer": executer });
      }

      while (pids.length) {
        const pid = pids.pop();
        await waitTargetPid(ns, pid.pid, pid.executer);
      }
    }
  }
  log.info(ns, "Last line of targeted.js");
}
