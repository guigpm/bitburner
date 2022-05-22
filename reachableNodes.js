import { Queue } from "./lib";

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  let maxDistance = 1;
  if (ns.args.length == 1) {
    maxDistance = ns.args[0];
  } else {
    if (ns.fileExists("DeepscanV2.exe")) {
      maxDistance = 10;
    } else if (ns.fileExists("DeepscanV1.exe")) {
      maxDistance = 5;
    } else {
      maxDistance = 3;
    }
  }
  const visited = [];
  const queue = new Queue();
  queue.enqueue({ "name": "home", "distance": 1 })

  while (!queue.isEmpty) {
    const current = queue.dequeue();
    visited.push(current.name);

    const adjacents = ns.scan(current.name);
    if (current.distance <= maxDistance) {
      for (const adjacent of adjacents) {
        if (!visited.includes(adjacent)) {
          queue.enqueue({ "name": adjacent, "distance": current.distance + 1 });
        }
      }
    }
  }
  ns.tprint(visited);
}