import { deploy } from "./lib";

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
    const origin = ns.args[0];
    const destination = ns.args[1];
    await deploy(ns, destination, origin);
}
