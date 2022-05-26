import { getMoneyThreshold, getSecurityThreshold, thresholds } from './lib.js';
import { logLevel } from './log.js';
import { Context } from "./context";

let activeExecuters = [];

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  const ctx = new Context(ns);

  if (ctx.ns.args.length < 1) {
    log.fatal("Usage: target [logLevel] [from]");
    ctx.ns.exit(1);
  }
  const target = ctx.ns.args[0];
  ctx.log.logLevel = ctx.ns.args[1] ?? logLevel.trace;
  let serverFrom = ctx.ns.args[2] ?? null;
  if (serverFrom) {
    serverFrom = `[From: ${serverFrom}] `;
  } else {
    serverFrom = '';
  }

  const moneyCurrent = ctx.ns.getServerMoneyAvailable(target);
  const moneyMax = ctx.ns.getServerMaxMoney(target);
  const moneyThresh = getMoneyThreshold(ctx, target);
  ctx.log.trace(serverFrom + '---Money---', target);
  ctx.log.trace(serverFrom + 'Max Server Money: ' + ctx.ns.nFormat(moneyMax, '$0.00a'), target);
  ctx.log.trace(serverFrom + 'Current Server Money: ' + ctx.ns.nFormat(moneyCurrent, '$0.00a'), target);
  ctx.log.trace(serverFrom + `Money Threshold (${thresholds.money} * Max Server Money): ` + ctx.ns.nFormat(moneyThresh, '$0.00a'), target);
  ctx.log.trace(serverFrom + 'Condition to <grow> (Current Server Money < Money Threshold): ' + ((moneyCurrent < moneyThresh) ? 'True' : 'False'), target);

  const securityCurrent = ctx.ns.getServerSecurityLevel(target);
  const securityMin = ctx.ns.getServerMinSecurityLevel(target);
  const securityThresh = getSecurityThreshold(ctx, target);
  ctx.log.trace(serverFrom + '---Security---', target);
  ctx.log.trace(serverFrom + 'Min Server Security: ' + securityMin, target);
  ctx.log.trace(serverFrom + 'Current Server Security: ' + securityCurrent, target);
  ctx.log.trace(serverFrom + `Security Threshold (Min Server Security + ${thresholds.security}): ` + securityThresh, target);
  ctx.log.trace(serverFrom + 'Condition to <weak> (Current Server Security > Security Threshold): ' + ((securityCurrent > securityThresh) ? 'True' : 'False'), target);
  ctx.log.trace(serverFrom + '---------', target);

}
