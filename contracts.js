import { BaseContext } from "./base";
import { Context } from "./context";
import { logLevel } from "./log";
import { Contract } from "./libContracts";

/**
 * @param {Context} ctx 
 * @param {string} server 
 * @param {number} _ 
 * @returns {Contract}
 */
function visitServer(ctx, server, _) {
    const contracts = ctx.ns.ls(server, ".cct").map((contract) => {
        const type = ctx.ns.codingcontract.getContractType(contract, server);
        const triesRemaining = ctx.ns.codingcontract.getNumTriesRemaining(contract, server);
        const description = ctx.ns.codingcontract.getDescription(contract, server);
        const input = ctx.ns.codingcontract.getData(contract, server);
        const contractClass = Contract.factory(type);
        return new contractClass(ctx, server, contract, type, triesRemaining, description, input);
    });
    return contracts;
}

class ContractsTable extends BaseContext {

    /**
     * @param {Context} ctx 
     * @param {Contract[]} contracts 
     */
    constructor(ctx, contracts) {
        super(ctx);
        this.contracts = contracts;
    }

    print() {
        const paddings = [20, 50, 5, 15, 10];
        const headers = "Server Type # HasSolution TriesRem"
            .split(" ")
            .map((header, index) => header.padStart(paddings[index]))
            .join('');
        this.ns.tprintf(headers);
        let separator = [];
        for (var i = 0; i < headers.length; i++)
            separator.push("-");
        separator = separator.join("")
        this.ns.tprintf(separator);
        this.contracts.forEach((contract, index) => {
            const solution = typeof contract.solution === 'function' ? "✓" : "X";
            const row = [contract.server, contract.type, index + 1, solution, contract.triesRemaining]
                .map((value, index) => value.toString().padStart(paddings[index]))
                .join("");
            this.ns.tprintf(row);
        });
    }
}

export async function main(ns) {
    const ctx = new Context(ns);
    ctx.log.logLevel = logLevel.debug;
    if (ctx.ns.args.length == 0) ctx.ns.args.push("list");
    if (![1, 2].includes(ctx.ns.args.length)) {
        ctx.log.fatal("run contracts.js list|read|solve <#number>");
    }
    const contracts = ctx.BreadthFirstSearch().traverse(visitServer);
    contracts.sort((a, b) => (a.server > b.server) ? 1 : ((b.server > a.server) ? -1 : 0));

    const operation = ctx.ns.args[0];
    if (operation == "list") {
        new ContractsTable(ctx, contracts).print();
        ctx.ns.tprintf("run contracts.js list | read | solve <#number|all>");
        return;
    }
    const contractNumber = ctx.ns.args[1];
    if (operation === "read" && contractNumber === "all" || (contractNumber < 0 || contractNumber >= contracts.length)) {
        ctx.log.fatal("'all' is not supported for 'read' or number is out of range");
    }
    if (operation === "read") {
        contracts[contractNumber - 1].read();
        return;
    }
    if (operation === "solve") {
        if (contractNumber === "all") {
            for (const contract of contracts) {
                try {
                    contract.attempt();
                } catch (e) {
                    ctx.log.debug(e.message);
                }
            }
        } else if (contractNumber < 0 || contractNumber >= contracts.length) {
            ctx.log.fatal("number is out of range");
        } else {
            contracts[contractNumber - 1].attempt();
        }
    }
}
