import { canBeHacked, disableFunctionLog, getMoneyThreshold, getSecurityThreshold, thresholds } from './lib.js';
import { log, logLevel } from './log.js';

let activeExecuters = [];

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  if (ns.args.length < 1) {
    log.fatal(ns, "Usage: target [logLevel] [from]");
    ns.exit(1);
  }
  const target = ns.args[0];
  log.logLevel = ns.args[1] ?? logLevel.trace;
  let serverFrom = ns.args[2] ?? null;
  if (serverFrom) {
    serverFrom = `[From: ${serverFrom}] `;
  } else {
    serverFrom = '';
  }

  const moneyCurrent = ns.getServerMoneyAvailable(target);
  const moneyMax = ns.getServerMaxMoney(target);
  const moneyThresh = getMoneyThreshold(ns, target);
  log.trace(ns, serverFrom + '---Money---', target);
  log.trace(ns, serverFrom + 'Max Server Money: ' + ns.nFormat(moneyMax, '$0.00a'), target);
  log.trace(ns, serverFrom + 'Current Server Money: ' + ns.nFormat(moneyCurrent, '$0.00a'), target);
  log.trace(ns, serverFrom + `Money Threshold (${thresholds.money} * Max Server Money): ` + ns.nFormat(moneyThresh, '$0.00a'), target);
  log.trace(ns, serverFrom + 'Condition to <grow> (Current Server Money < Money Threshold): ' + ((moneyCurrent < moneyThresh) ? 'True' : 'False'), target);

  const securityCurrent = ns.getServerSecurityLevel(target);
  const securityMin = ns.getServerMinSecurityLevel(target);
  const securityThresh = getSecurityThreshold(ns, target);
  log.trace(ns, serverFrom + '---Security---', target);
  log.trace(ns, serverFrom + 'Min Server Security: ' + securityMin, target);
  log.trace(ns, serverFrom + 'Current Server Security: ' + securityCurrent, target);
  log.trace(ns, serverFrom + `Security Threshold (Min Server Security + ${thresholds.security}): ` + securityThresh, target);
  log.trace(ns, serverFrom + 'Condition to <weak> (Current Server Security > Security Threshold): ' + ((securityCurrent > securityThresh) ? 'True' : 'False'), target);
  log.trace(ns, serverFrom + '---------', target);

}
