import { canBeHacked, serversWithinDistance, waitTargetPid } from './lib.js';
import { logLevel, disableFunctionLog } from './log.js';
import { Context } from "./context";

export async function main(ns) {
  const ctx = new Context(ns);
  ctx.log.logLevel = logLevel.error;
  let executerServerNames = ["home-"];
  let unstopableExecution = false;
  if (ctx.ns.args.length > 0) {
    const firstElement = ctx.ns.args.shift();
    log.trace(`firstElement: ${firstElement}`);
    unstopableExecution = `${firstElement}`.toLocaleLowerCase() === 'forever';
    if (!unstopableExecution) {
      ctx.ns.args.push(firstElement);
    }
    if (ctx.ns.args.length) {
      executerServerNames = ctx.ns.args;
    }
  }

  ctx.log.trace(`unstopableExecution: ${unstopableExecution}`);
  ctx.log.trace(`executerServerNames: ${executerServerNames}`);

  disableFunctionLog(ctx, "sleep");

  /** @param {string} server */
  const filterExecuters = (server) => {
    return executerServerNames.filter((executer) => server.startsWith(executer));
  }

  do {
    await waitTargetPid(ctx, ctx.ns.run("crawler2.js", 1, 'own'));
    const servers = serversWithinDistance(ctx, 10);
    const targets = servers.filter((server) => server !== "home" && filterExecuters(server).length == 0);

    ctx.log.info(`Targets: ${targets.toString()}`);
    for (const target of targets) {
      const activeExecuters = serversWithinDistance(ctx, 1).filter((server) => filterExecuters(server).length > 0);
      if (canBeHacked(ctx, target, 'harvest.js', !unstopableExecution)) {
        await breakServer(ctx, target, activeExecuters);
      }
    }
    await ctx.ns.sleep(500);
  } while (unstopableExecution);
  ctx.log.info("Last line of " + ctx.ns.getScriptName());
}

/**
 * @param {string} target Defines the "target server"
 * @param {string[]} executers List of servers name to execute action to break target server
 */
async function breakServer(ctx, target, executers) {
  const pids = [];
  for (const executer of executers) {
    const pid = ctx.ns.run("breakServer.js", 1, executer, target);
    pids.push({ "pid": pid, "executer": executer });
  }

  while (pids.length) {
    const pid = pids.pop();
    await waitTargetPid(ctx, pid.pid, pid.executer);
  }
}
