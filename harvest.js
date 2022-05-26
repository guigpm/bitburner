import { getMaxThreads, growCondition, weakenCondition } from './lib.js';
import { Context } from "./context";

export async function main(ns) {
  const ctx = new Context(ns);

  if (ctx.ns.args.length != 1) {
    ctx.log.fatal();
    ctx.ns.tprint("Missing argument 0: <target>")
    ctx.ns.exit(1)
  }

  var target = ctx.ns.args[0];

  const weakThreads = getMaxThreads(ctx.ns, target, 1.75);
  const growThreads = getMaxThreads(ctx.ns, target, 1.75);
  const hackThreads = getMaxThreads(ctx.ns, target, 1.7);

  while (true) {
    let process = undefined;
    if (weakenCondition(ctx.ns, target)) {
      process = ctx.Process("weak.js", target).start(target, weakThreads);
      await ctx.ns.weaken(target);
    } else if (growCondition(ctx.ns, target)) {
      process = ctx.Process("grow.js", target).start(target, growThreads);
      await ctx.ns.grow(target);
    } else {
      process = ctx.Process("hack.js", target).start(target, hackThreads);
      await ctx.ns.hack(target);
    }
    await process.wait();
  }
}
