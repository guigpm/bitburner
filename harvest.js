import { getMaxThreads, growCondition, waitTargetPid, weakenCondition } from './lib.js';
import { Context } from "./context";

export async function main(ns) {
  const ctx = new Context(ns);

  if (ctx.ns.args.length != 1) {
    ctx.log.fatal();
    ctx.ns.tprint("Missing argument 0: <target>")
    ctx.ns.exit(1)
  }

  var target = ctx.ns.args[0];

  const weakThreads = getMaxThreads(ctx, target, 1.75);
  const growThreads = getMaxThreads(ctx, target, 1.75);
  const hackThreads = getMaxThreads(ctx, target, 1.7);

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    let execPID = null;
    if (weakenCondition(ctx, target)) {
      if (weakThreads) {
        execPID = ctx.ns.exec("weak.js", target, weakThreads, target);
      }

      // If the server's security level is above our threshold, weaken it
      await ctx.ns.weaken(target);
    } else if (growCondition(ctx, target)) {
      if (growThreads) {
        execPID = ctx.ns.exec("grow.js", target, growThreads, target);
      }

      // If the server's money is less than our threshold, grow it
      await ctx.ns.grow(target);
    } else {
      if (hackThreads) {
        execPID = ctx.ns.exec("hack.js", target, hackThreads, target);
      }

      // Otherwise, hack it
      await ctx.ns.hack(target);
    }

    if (execPID) {
      await waitTargetPid(ctx, execPID, target);
    }
  }
}
