import { BaseContext } from "./base";
/**
 * Find maximum profit earned from at most `k` stock transactions.
 * Input to the function is stock prices of `n` days and positive number `k`
 * 
 * Problem description:
 * 
 * You are given the following array with two elements:
 * i.e.: [9, [56,98,108,72,95,122,170,176,185,121,162,23,71,124,172,82,107,43]]
 * The first element is an integer k. The second element is an array of stock prices (which are numbers) where the i-th element represents the stock price on day i.
 * Determine the maximum possible profit you can earn using at most k transactions. A transaction is defined as buying and then selling one share of the stock. Note that you cannot engage in multiple transactions at once. In other words, you must sell the stock before you can buy it again.
 * If no profit can be made, then the answer should be 0.
 * 
 * @from https://www.techiedelight.com/find-maximum-profit-earned-at-most-k-stock-transactions/
 * 
 * @param {[int, int[]]} input
 * @returns {number} value of max profit
 */
export function findMaxProfit(input) {
    const transactions = (input[0] ?? 0) * 1;
    const price = input[1] ?? [];

    // get the number of days
    const days = price.length;

    // base case
    if (days <= 1 || transactions == 0) {
        return 0;
    }

    // profit[transaction][day] stores the maximum profit gained by doing
    // at most `transaction` transactions till `day`'th day
    const profit = Array(transactions + 1).fill(Array(days).fill(0));

    // fill profit[][] in a bottom-up fashion
    for (let transaction = 0; transaction <= transactions; transaction++) {
        let prevDiff = -Infinity;
        for (let day = 0; day < days; day++) {
            if (transaction == 0 || day == 0) {
                profit[transaction][day] = 0;
            } else {
                prevDiff = Math.max(prevDiff, profit[transaction - 1][day - 1] - price[day - 1]);
                profit[transaction][day] = Math.max(profit[transaction][day - 1], price[day] + prevDiff);
            }
        }
    }

    return profit[transactions][days - 1];
}

class NotImplemented extends Error {
    constructor(message = "", ...args) {
        super(message, ...args);
        this.message = message + " has not yet been implemented.";
    }
}

export class Contract extends BaseContext {
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
            case "Find Largest Prime Factor":
                return LargestPrimeFactor;
            case "Algorithmic Stock Trader I":
                return AlgorithmicStockTraderI;
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

class AlgorithmicStockTraderI extends Contract {
    /**
     * You are given the following array of stock prices(which are numbers) where the i - th element represents the stock price on day i:

        14, 134, 96, 4, 160, 25, 89, 42, 3, 158, 51, 70, 78
        Determine the maximum possible profit you can earn using at most one transaction(i.e.you can only buy and sell the stock once).
        If no profit can be made then the answer should be 0. Note that you have to buy the stock before you can sell it
     */
    solution(prices) {
        if (prices.length < 2) {
            return 0;
        }
        let minPrice = prices[0];
        let maxProfit = prices[1] - prices[0];

        for (let i = 1; i < prices.length; i++) {
            const currentPrice = prices[i];

            const potentialProfit = currentPrice - minPrice;

            maxProfit = Math.max(maxProfit, potentialProfit);
            minPrice = Math.min(minPrice, currentPrice);
        }
        return Math.max(0, maxProfit);
    }
}

class LargestPrimeFactor extends Contract {
    // A prime factor is a factor that is a prime number.
    // Factors of a number are always prime, iterate over possible factors keeping the highest seen
    solution(target) {
        let currentFactor = 2;
        let largestFactor = -Infinity;
        while (target > 1) {
            while (target % currentFactor == 0) {
                largestFactor = currentFactor;
                target = target / currentFactor;
            }
            currentFactor += 1;
        }
        return largestFactor;
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