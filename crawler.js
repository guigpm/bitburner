import { waitTargetPid, deploy, openPorts } from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";

/**
 * @param {string} target
 */
async function spread(ctx, target) {
  if (ctx.ns.isRunning(ctx.ns.getScriptName(), target, ctx.ns.args[0])) {
    // if (ctx.ns.fileExists("crawler_exec.txt", target)) {
    ctx.log.info(`Skipping Spread on ${target}`);
    return;
  }
  ctx.log.info(`Starting ${ctx.ns.getScriptName()} on ${target}`);
  const pid = ctx.ns.exec(ctx.ns.getScriptName(), target, 1, ctx.ns.args[0]);
  if (pid == 0) {
    ctx.log.warning(`Script ${ctx.ns.getScriptName()} didn't start on ${target}, probably not enough RAM`);
    return;
  }
  await ctx.ns.sleep(1500);
  await waitTargetPid(ctx, pid, target);
  ctx.log.debug(`Finished executing ${ctx.ns.getScriptName()} on ${target}`);
}

/**
 * @param {string} target
 */
async function own(ctx, target) {
  ctx.log.info(`Gaining Root Access on ${target}`);
  if (openPorts(ctx.ns, target)) {
    ctx.ns.nuke(target);
    ctx.log.info(`Nuked on ${target}`);
  } else {
    ctx.log.error(`Can't open ports on ${target}`);
  }
}

/**
 * @param {string} target
 */
async function startHack(ctx, target) {
  ctx.log.info(`Start harvest on ${target}`);
  const availableRam = ctx.ns.getServerMaxRam(target) - ctx.ns.getServerUsedRam(target)
  const harvestRam = ctx.ns.getScriptRam("harvest.js");
  const threads = Math.floor(availableRam / harvestRam);
  if (threads) {
    const pid = ctx.ns.exec("harvest.js", target, 1, target);
    if (pid == 0) {
      ctx.log.warning(`Failed to start harvest.js on ${target}. Probably no RAM.`);
    }
  } else {
    ctx.log.error(`${target} has no available RAM.`);
  }
}

/**
 * @param {string} target
 */
async function killall_target(ctx, target) {
  ctx.log.info(`Killing all process on ${target}`);
  ns.killall(target);
  ctx.log.debug(`Deleted ${ctx.ns.getScriptName()} on ${target}`);
}

export async function main(ns) {
  const ctx = new Context(ns);
  ctx.log.logLevel = logLevel.debug;
  if (ns.args.length != 1) {
    ctx.log.fatal("Usage: HACK|KILLALL|DEPLOY");
    ns.exit(1);
  }

  const operation = ns.args[0];
  const adjacents = ns.scan().filter(adjacent => !adjacent.startsWith("home-") && adjacent != "home");
  ctx.log.debug(adjacents);
  for (var i = 0; i < adjacents.length; i++) {
    const target = adjacents[i];
    await own(ctx, target);
    await deploy(ctx, target);
    if (operation.toLowerCase() == "hack") {
      await spread(ctx, target);
      await startHack(ctx, target);
    } else if (operation.toLowerCase() == "killall") {
      await killall_target(ctx, target);
      await spread(ctx, target);
    } else if (operation.toLowerCase() == "deploy") {
      await spread(ctx, target);
    } else {

    }
  }
  ctx.log.debug(`Last line of ${ns.getScriptName()}`);
}