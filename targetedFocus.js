import { canBeHacked, disableFunctionLog, serversWithinDistance, waitTargetPid } from './lib.js';
import { log, logLevel } from './log.js';

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {

  let executerServerNames = ["home-"];
  if (ns.args.length > 0) {
    executerServerNames = ns.args;
  }

  const unstopableExecution = true;

  disableFunctionLog(ns, "sleep");

  log.logLevel = logLevel.debug;

  const servers = serversWithinDistance(ns, 10);

  /** @param {string} server */
  const filterExecuters = (server) => {
    return executerServerNames.filter((executer) => server.startsWith(executer));
  }

  const activeExecuters = servers.filter((server) => filterExecuters(server).length > 0);
  const targets = servers.filter((server) => server !== "home" && filterExecuters(server).length == 0);

  // ns.tprint(activeExecuters);
  // ns.tprint(targets);

  log.info(ns, `Targets: ${targets.toString()}`);
  while (unstopableExecution) {
    for (const target of targets) {
      if (canBeHacked(ns, target, 'harvest.js', !unstopableExecution)) {
        await breakServer(ns, target, activeExecuters);
      }
    }
  }
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
