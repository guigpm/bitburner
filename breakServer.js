import { deploy, getMaxThreadsFromScript, growCondition, weakenCondition } from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";

export async function main(ns) {
  const ctx = new Context(ns);
  ctx.log.logLevel = logLevel.trace;
  ctx.log.disableLog("sleep");
  const executer = ctx.ns.args[0];
  const target = ctx.ns.args[1];
  if (executer != "home") {
    await deploy(ctx, executer);
  }
  await deploy(ctx, target);

  const weakThreads = getMaxThreadsFromScript(ctx, executer, "weak.js");
  const growThreads = getMaxThreadsFromScript(ctx, executer, "grow.js");
  const harvestThreads = getMaxThreadsFromScript(ctx, target, "harvest.js");
  const harvestRunning = ctx.ns.isRunning("harvest.js", target, target);
  let pid = 0, stop = false;

  if (harvestRunning) {
    ctx.log.info(`Already running 'harvest.js' on ${target}.`);
  } else if (harvestThreads) {
    pid = ctx.ns.exec("harvest.js", target, 1 /* Thread */, target);
    ctx.log.trace(`Started 'harvest.js' on ${target} with PID=<${pid ?? 'NULL'}>.`)
  } else {
    ctx.log.error(`Can't start 'harvest.js' on ${target}. Probably no RAM.`);
  }

  ctx.log.info(`Breaking server ${target} on ${executer}`);
  while (!stop) {
    if (weakenCondition(ctx, target)) {
      ctx.log.debug(`Weak ${target} on ${executer}`);
      if (weakThreads) {
        pid = ctx.ns.exec("weak.js", executer, weakThreads, target);
      } else {
        ctx.log.error(`Can't weak on ${executer}. Probably no RAM.`);
        break;
      }
    } else if (growCondition(ctx, target)) {
      ctx.log.debug(`Grow ${target} on ${executer}`);
      if (growThreads) {
        pid = ctx.ns.exec("grow.js", executer, growThreads, target);
      } else {
        ctx.log.error(`Can't grow on ${executer}. Probably no RAM.`);
        break;
      }
    } else {
      ctx.log.debug(`Harvest ${target} on ${executer}`);
      if (harvestRunning || harvestThreads) {
        break;
      } else {
        pid = ctx.ns.exec("hack.js", executer, getMaxThreadsFromScript(ctx, executer, "hack.js"), target);
        ctx.log.info(`Hacking on ${executer}.`);
        stop = true;
      }
    }
    while (pid && ctx.ns.isRunning(pid, executer)) {
      await ctx.ns.sleep(500);
    }
  }
}
