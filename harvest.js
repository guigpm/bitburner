import { getMaxThreads, growCondition, weakenCondition } from './lib.js';
import { Context } from "./context";
import { Process } from './process.js';

export async function main(ns) {
  const ctx = new Context(ns);

  if (ctx.ns.args.length != 1) {
    ctx.log.fatal();
    ctx.ns.tprint("Missing argument 0: <target>")
    ctx.ns.exit(1)
  }

  var target = ctx.ns.args[0];
  const hostName = ctx.ns.getHostname();

  const weakThreads = getMaxThreads(ctx.ns, hostName, 1.75, 2);
  const growThreads = getMaxThreads(ctx.ns, hostName, 1.75, 2);
  const hackThreads = getMaxThreads(ctx.ns, hostName, 1.7, 2);

  while (true) {
    let process = undefined;
    if (weakenCondition(ctx.ns, target)) {
      process = new Process(ctx, "weak.js", target).start(hostName, weakThreads);
      await ctx.ns.weaken(target);
    } else if (growCondition(ctx.ns, target)) {
      process = new Process(ctx, "grow.js", target).start(hostName, growThreads);
      await ctx.ns.grow(target);
    } else {
      process = new Process(ctx, "hack.js", target).start(hostName, hackThreads);
      await ctx.ns.hack(target);
    }
    await process.wait();
  }
}
