import { canBeHacked, disableFunctionLog, serversWithinDistance, waitTargetPid } from './lib.js';
import { log, logLevel } from './log.js';

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  log.logLevel = logLevel.error;
  let executerServerNames = ["home-"];
  let unstopableExecution = false;
  if (ns.args.length > 0) {
    const firstElement = ns.args.shift();
    log.trace(ns, `firstElement: ${firstElement}`);
    unstopableExecution = `${firstElement}`.toLocaleLowerCase() === 'forever';
    if (!unstopableExecution) {
      ns.args.push(firstElement);
    }
    if (ns.args.length) {
      executerServerNames = ns.args;
    }
  }

  log.trace(ns, `unstopableExecution: ${unstopableExecution}`);
  log.trace(ns, `executerServerNames: ${executerServerNames}`);

  disableFunctionLog(ns, "sleep");

  /** @param {string} server */
  const filterExecuters = (server) => {
    return executerServerNames.filter((executer) => server.startsWith(executer));
  }

  do {
    await waitTargetPid(ns, ns.run("crawler2.js", 1, 'own'));
    const servers = serversWithinDistance(ns, 10);
    const targets = servers.filter((server) => server !== "home" && filterExecuters(server).length == 0);

    log.info(ns, `Targets: ${targets.toString()}`);
    for (const target of targets) {
      const activeExecuters = serversWithinDistance(ns, 1).filter((server) => filterExecuters(server).length > 0);
      if (canBeHacked(ns, target, 'harvest.js', !unstopableExecution)) {
        await breakServer(ns, target, activeExecuters);
      }
    }
    await ns.sleep(500);
  } while (unstopableExecution);
  log.info(ns, "Last line of " + ns.getScriptName());
}

/**
 * @param {import("./NameSpace").NS} ns 
 * @param {string} target Defines the "target server"
 * @param {string[]} executers List of servers name to execute action to break target server
 */
async function breakServer(ns, target, executers) {
  const pids = [];
  for (const executer of executers) {
    const pid = ns.run("breakServer.js", 1, executer, target);
    pids.push({ "pid": pid, "executer": executer });
  }

  while (pids.length) {
    const pid = pids.pop();
    await waitTargetPid(ns, pid.pid, pid.executer);
  }
}
