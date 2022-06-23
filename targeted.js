import { serversWithinDistance } from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";
import { InvasionTarget } from "./invade";
import { Process } from './process.js';

export async function main(ns) {
  const ctx = new Context(ns);
  ctx.log.logLevel = logLevel.error;
  let executerServerNames = [ctx.homeMachinePrefix];
  let unstopableExecution = false;
  if (ctx.ns.args.length > 0) {
    const firstElement = ctx.ns.args.shift();
    ctx.log.trace(`firstElement: ${firstElement}`);
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

  /** @param {string} server */
  const filterExecuters = (server) => {
    return executerServerNames.filter((executer) => server.startsWith(executer));
  }

  do {
    await new Process(ctx, "crawler2.js", "hack").startLocal(1).wait();
    const servers = serversWithinDistance(ctx.ns);
    const targets = servers.filter((server) => server !== "home" && filterExecuters(server).length == 0);

    ctx.log.info(`Targets: ${targets.toString()}`);
    for (const target of targets) {
      const activeExecuters = serversWithinDistance(ctx.ns, 1).filter((server) => filterExecuters(server).length > 0);

      if (new InvasionTarget(ctx, target).canBeHacked) {
        await breakServer(ctx, target, activeExecuters);
      }
    }
    await ctx.ns.sleep(500);
  } while (unstopableExecution);
  ctx.log.info("Last line of " + ctx.ns.getScriptName());
}

/**
 * @param {Context} ctx
 * @param {string} target Defines the "target server"
 * @param {string[]} executers List of servers name to execute action to break target server
 */
async function breakServer(ctx, target, executers) {
  const processes = executers.map(executer => new Process(ctx, "breakServer.js", executer, target).startLocal(1));
  for (const process of processes) {
    await process.wait();
  }
}
