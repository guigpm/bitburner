export class BaseClass {
  /** @type {import("./NameSpace").NS} ns */
  ns = null;

  /** @param {import("./NameSpace").NS} ns */
  constructor(ns) {
    this.ns = ns;
  }
}