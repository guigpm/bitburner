import { formatMoney, formatRam } from "./lib";
import { Context } from "./context";
import { logLevel } from "./log";

function print(ctx, body) {
    const paddings = [5, 10, 15];
    const header = "# RAM Price"
        .split(" ")
        .map((header, index) => header.padStart(paddings[index]))
        .join('');
    let separator = [];
    for (var i = 0; i < header.length; i++) {
        separator.push("-");
    }
    separator = separator.join("")
    ctx.ns.tprintf(header)
    ctx.ns.tprintf(separator)
    for (const row of body) {
        const id = row.id.toString().padStart(paddings[0])
        const ram = row.ram.padStart(paddings[1])
        const price = row.price.padStart(paddings[2])
        ctx.ns.tprintf(`${id}${ram}${price}`)
    }
}

/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
    const ctx = new Context(ns);
    ctx.log.logLevel = logLevel.warn;

    let ram = 1 // 1 gb

    const rows = [];
    for (let i = 0; i <= 20; i++) {
        rows.push({ "id": i, "price": formatMoney(ctx.ns, ctx.ns.getPurchasedServerCost(ram)), "ram": `${formatRam(ram)}` })
        ram = ram * 2
    }

    print(ctx, rows)
}