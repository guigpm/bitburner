export class BaseClass {
  /** @type {import("./NameSpace").NS} ns */
  ns = undefined;

  /** @param {import("./NameSpace").NS} ns */
  constructor(ns) {
    this.ns = ns;
  }
}

export class BaseContext extends BaseClass {
  /** @type {import("./context").Context} ctx */
  ctx = undefined;

  /** @param {import("./context").Context} ctx */
  constructor(ctx) {
    super(ctx.ns);
    this.ctx = ctx;
  }
}