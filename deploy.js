import { deploy } from "./lib";

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
    const ctx = new Context(ns);
    const origin = ctx.ns.args[0];
    const destination = ctx.ns.args[1];
    await deploy(ctx, destination, origin);
}
