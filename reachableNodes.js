import { serversWithinDistance } from "./lib";

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  if (ns.args.length != 1) {
    ns.tprint("Usage: maxDistance");
    ns.exit(1);
  }
  const distance = ns.args[0];
  ns.tprint(serversWithinDistance(distance))
}