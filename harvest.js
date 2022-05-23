import { getMaxThreads, getMoneyThreshold, getSecurityThreshold, growCondition, waitTargetPid, weakenCondition } from './lib.js';
import { log } from './log.js';

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  if (ns.args.length != 1) {
    log.fatal();
    ns.tprint("Missing argument 0: <target>")
    ns.exit(1)
  }

  var target = ns.args[0];

  const weakThreads = getMaxThreads(ns, target, 1.75);
  const growThreads = getMaxThreads(ns, target, 1.75);
  const hackThreads = getMaxThreads(ns, target, 1.7);

  // Infinite loop that continously hacks/grows/weakens the target server
  while (true) {
    let execPID = null;
    if (weakenCondition(ns, target)) {
      if (weakThreads) {
        execPID = ns.exec("weak.js", target, weakThreads, target);
      }

      // If the server's security level is above our threshold, weaken it
      await ns.weaken(target);
    } else if (growCondition(ns, target)) {
      if (growThreads) {
        execPID = ns.exec("grow.js", target, growThreads, target);
      }

      // If the server's money is less than our threshold, grow it
      await ns.grow(target);
    } else {
      if (hackThreads) {
        execPID = ns.exec("hack.js", target, hackThreads, target);
      }

      // Otherwise, hack it
      await ns.hack(target);
    }

    if (execPID) {
      await waitTargetPid(ns, execPID, target);
    }
  }
}
