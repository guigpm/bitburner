import { BaseContext } from "./base";
import { Context } from "./context";
import { logLevel } from "./log";

class NotImplemented extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message + " has not yet been implemented.";
    }
}

class Contract extends BaseContext {
    constructor(ctx, server, filename, type, tries, description, input) {
        super(ctx);
        this.server = server;
        this.filename = filename;
        this.type = type;
        this.triesRemaining = tries;
        this.description = description;
        this.input = input;
    }
    static factory(contractType) {
        switch (contractType) {
            case "Unique Paths in a Grid I":
                return UniquePathsInAGridI;
            case "Unique Paths in a Grid II":
                return UniquePathsInAGridII;
            case "Total Ways to Sum":
                return TotalWaysToSum;
            default:
                return Contract;
        }
    }
    read() {
        this.ctx.ns.tprintf(``);
        this.ctx.ns.tprintf(`${this.type} @ ${this.server} - ${this.triesRemaining} attempts remaining`);
        this.ctx.ns.tprintf(``);
        this.ctx.ns.tprintf(``);
        this.ctx.ns.tprintf(`${this.description}`);
        this.ctx.ns.tprintf(``);

        this.ctx.ns.tprintf(`Input: ${this.input}`);
    }
    attempt() {
        if (this.solution === undefined) {
            throw new NotImplemented(this.type);
        }
        if (this.triesRemaining > 0) {

            const answer = this.solution(this.input);
            const reward = this.ns.codingcontract.attempt(answer, this.filename, this.server, { "returnReward": true });

            if (reward.length === 0) {
                this.ctx.log.error(`Wrong answer: ${answer} (input=${input}) Attempts left ${this.triesRemaining - 1}`);
            }
            else {
                this.ns.tprint(`SUCCESS! ${reward}`);
            }
        }
        else {
            this.ctx.log.warning(`Contract not submitted, not enough attempts left.`);
        }
    }
}

class TotalWaysToSum extends Contract {
    /**
     * It is possible write four as a sum in exactly four different ways:
        3 + 1
        2 + 2
        2 + 1 + 1
        1 + 1 + 1 + 1
        How many different distinct ways can the number 99 be written as a sum of at least two positive integers?

        Uses dynamic programing: builds a solution array iterating over all the numbers from 1 to target and
        computes how many combinations are possible using all the numbers from 1 to target-1
     */
    solution(targetNumber) {
        const solutions = [];
        for (let i = 0; i <= targetNumber; i++)
            solutions.push(0);
        solutions[0] = 1;
        for (let upTo = 1; upTo < targetNumber; upTo++) {
            for (let target = 1; target <= targetNumber; target++) {
                if (target >= upTo) {
                    // this.ctx.log.debug(`Distinct ways to reach ${target} using numbers from [1, ${upTo}]: ${solutions[target] + solutions[target - upTo]}`);
                    solutions[target] = solutions[target] + solutions[target - upTo];
                }
            }
        }
        return solutions[targetNumber];
    }
}

class UniquePathsInAGridI extends Contract {
    solution(input) {
        const rows = input[0];
        const columns = input[1];
        const uniquePaths = [];
        for (let i = 0; i < rows; i++) {
            uniquePaths[i] = [];
            for (let j = 0; j < columns; j++) {
                uniquePaths[i].push(1);
            }
        }
        // 1 1
        // 1 X
        // X = [x-1][y] + [x][y-1];
        for (let i = 1; i < rows; i++) {
            for (let j = 1; j < columns; j++) {
                uniquePaths[i][j] = uniquePaths[i - 1][j] + uniquePaths[i][j - 1];
            }
        }
        return uniquePaths[rows - 1][columns - 1];
    }
}

class UniquePathsInAGridII extends Contract {
    solution(grid) {
        const rows = grid.length;
        const columns = grid[0].length;

        if (grid[0][0] === 1) return 0;

        grid[0][0] = 1;
        // Set the first column distances to be 1 or 0 depending on obstacles
        for (let i = 1; i < rows; i++) {
            if (grid[i][0] == 0 && grid[i - 1][0] == 1) {
                grid[i][0] = 1;
            } else {
                grid[i][0] = 0;
            }
        }
        // Set the first row distances to be 1 or 0 depending on obstacles
        for (let i = 1; i < columns; i++) {
            if (grid[0][i] === 0 && grid[0][i - 1] === 1) {
                grid[0][i] = 1;
            } else {
                grid[0][i] = 0;
            }
        }
        // 1 1
        // 1 X
        // X = [x-1][y] + [x][y-1];
        for (let i = 1; i < rows; i++) {
            for (let j = 1; j < columns; j++) {
                if (grid[i][j] == 0) {
                    grid[i][j] = grid[i - 1][j] + grid[i][j - 1];
                }
                else {
                    grid[i][j] = 0;
                }
            }
        }
        return grid[rows - 1][columns - 1];
    }
}

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
