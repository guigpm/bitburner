import { BaseClass } from './base.js';
import { growCondition, weakenCondition } from './lib.js';
import { Log } from './log.js';

export class Context extends BaseClass {
  /** @type {Log} log */
  log = undefined;

  constructor(ns) {
    super(ns);
    this.log = this.factory(Log);
  }

  /** 
   * @param {BaseContext} class_
   * @param {any[]} args
   * @returns {BaseContext} 
   */
  factory(class_, ...args) {
    return new class_(this, ...args);
  }
}

export async function main(ns) {
  const ctx = new Context(ns);
  ctx.log.logLevel = logLevel.error;
  if (ctx.ns.args.length != 1) {
    ctx.log.fatal();
    ctx.ns.tprint("Missing argument 0: <target>")
    ctx.ns.exit(1)
  }

  var target = ctx.ns.args[0];
  while (true) {
    // let process = undefined;
    if (weakenCondition(ctx.ns, target)) {
      await ctx.ns.weaken(target);
    } else if (growCondition(ctx.ns, target)) {
      await ctx.ns.grow(target);
    } else {
      await ctx.ns.hack(target);
    }
  }
}
