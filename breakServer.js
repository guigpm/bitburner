import { deploy, getMaxThreadsFromScript, growCondition, weakenCondition } from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";

export async function main(ns) {
  const ctx = new Context(ns);
  ctx.log.logLevel = logLevel.warning;
  const executer = ctx.ns.args[0];
  const target = ctx.ns.args[1];
  if (executer != "home") {
    await deploy(ctx, executer);
  }
  await deploy(ctx, target);

  const weakThreads = getMaxThreadsFromScript(ctx.ns, executer, "weak.js");
  const growThreads = getMaxThreadsFromScript(ctx.ns, executer, "grow.js");
  const hackThreads = getMaxThreadsFromScript(ctx.ns, executer, "hack.js");
  const harvestThreads = getMaxThreadsFromScript(ctx.ns, target, "harvest.js");
  const harvestRunning = ctx.ns.isRunning("harvest.js", target, target);
  const harvestProcess = ctx.Process("harvest.js", target);

  if (harvestRunning) {
    ctx.log.info(`${target} Already running 'harvest.js'.`);
  } else {
    harvestProcess.start(target, Math.min(1, harvestThreads));
  }

  ctx.log.info(`Breaking server ${target} on ${executer}`);
  while (true) {
    let process = undefined;
    if (weakenCondition(ctx.ns, target)) {
      process = ctx.Process("weak.js", target).start(executer, weakThreads);
    } else if (growCondition(ctx.ns, target)) {
      process = ctx.Process("grow.js", target).start(executer, growThreads);
    } else if (!harvestRunning && !harvestProcess.isRunning) {
      // Machine was idle, hack since you prepared it and leave
      // Only when target doesnt have memory for harvest!
      await ctx.Process("hack.js", target).start(executer, hackThreads).wait();
      return;
    } else {
      // Target already running harvest
      return;
    }
    if (process && !process.isRunning) {
      ctx.log.error(`Can't start ${process.script} on ${executer}. Probably no RAM or already running.`);
      return;
    }
    await process.wait();
  }
}
