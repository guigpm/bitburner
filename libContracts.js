import { BaseContext } from "./base";

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
            case "Generate IP Addresses":
                return GenerateIPAddresses;
            case "Unique Paths in a Grid I":
                return UniquePathsInAGridI;
            case "Unique Paths in a Grid II":
                return UniquePathsInAGridII;
            case "Total Ways to Sum":
                return TotalWaysToSum;
            case "Find All Valid Math Expressions":
                return FindAllValidMathExpressions;
            case "Find Largest Prime Factor":
                return LargestPrimeFactor;
            case "Algorithmic Stock Trader I":
                return AlgorithmicStockTraderI;
            case "Algorithmic Stock Trader II":
                return AlgorithmicStockTraderII;
            case "Algorithmic Stock Trader III":
                return AlgorithmicStockTraderIII;
            case "Algorithmic Stock Trader IV":
                return AlgorithmicStockTraderIV;
            case "Minimum Path Sum in a Triangle":
                return MinimumPathSumInATriangle;
            case "Array Jumping Game":
                return ArrayJumpingGame;
            case "Sanitize Parentheses in Expression":
                return SanitizeParenthesesInExpression;
            case "Proper 2-Coloring of a Graph":
                return Proper2ColoringOfAGraph;
            case "Shortest Path in a Grid":
                return ShortestPathInAGrid;
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
                this.ctx.log.error(`Wrong answer: ${answer} input=${this.input} Attempts left ${this.triesRemaining - 1}`);
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

class ShortestPathInAGrid extends Contract {
    position(x, y) {
        return { "x": x, "y": y };
    }
    iteration(position, path) {
        return { "position": position, "path": path };
    }
    valid(position, grid) {
        const rows = grid.length;
        const columns = grid[0].length;

        const withinX = position.x >= 0 && position.x < rows;
        const withinY = position.y >= 0 && position.y < columns;
        if (!withinX || !withinY) return false;
        const unblocked = grid[position.x][position.y] == 0;
        return unblocked;
    }
    solution(grid) {
        const rows = grid.length;
        const columns = grid[0].length;
        const target = this.position(rows - 1, columns - 1);
        const start = this.position(0, 0);
        const queue = [];
        const offsets = {
            "D": [1, 0],
            "U": [-1, 0],
            "R": [0, 1],
            "L": [0, -1]
        }
        queue.push(this.iteration(start, []));
        while (queue.length) {
            const current = queue.shift();
            const path = current.path;
            grid[current.position.x][current.position.y] = 1;
            if (current.position.x == target.x && current.position.y == target.y) {
                return path.join("");
            }
            for (let direction of ["D", "U", "R", "L"]) {
                const offsetX = offsets[direction][0];
                const offsetY = offsets[direction][1];
                const adjacent = this.position(current.position.x + offsetX, current.position.y + offsetY);
                if (this.valid(adjacent, grid)) {
                    queue.push(this.iteration(adjacent, path.concat(direction)));
                }
            }
        }
        return "";
    }
}

class FindAllValidMathExpressions extends Contract {
    // You are given the following string which contains only digits between 0 and 9:

    // 2705804

    // You are also given a target number of - 45. Return all possible ways you can add the + (add), -(subtract), and * (multiply) operators to the string such that it evaluates to the target number. (Normal order of operations applies.)

    // The provided answer should be an array of strings containing the valid expressions.The data provided by this problem is an array with two elements.The first element is the string of digits, while the second element is the target number:

    // ["2705804", -45]

    // NOTE: The order of evaluation expects script operator precedence NOTE: Numbers in the expression cannot have leading 0's. In other words, "1+01" is not a valid expression Examples:

    // Input: digits = "123", target = 6
    // Output: [1 + 2 + 3, 1 * 2 * 3]

    // Input: digits = "105", target = 5
    // Output: [1 * 0 + 5, 10 - 5]
    // Copied from here: https://leetcode.com/problems/expression-add-operators/solution/
    solution(_input) {
        const input = _input[0];
        const target = _input[1];
        const answers = [];
        function recurse(index, prev_operand, current_operand, value, string, answers) {
            if (index == input.length) {
                // If the final value == target expected AND
                // no operand is left unprocessed
                if (value == target && current_operand == 0) {
                    answers.push(string.slice(1, string.length).join(""));
                }
                return;
            }

            // Extending the current operand by one digit
            current_operand = current_operand * 10 + parseInt(input[index]);
            const str_op = current_operand.toString();

            // To avoid cases where we have 1 + 05 or 1 * 05 since 05 won't be a
            // valid operand.Hence this check
            if (current_operand > 0) {
                // NO OP recursion
                recurse(index + 1, prev_operand, current_operand, value, string, answers);
            }

            // ADDITION
            string.push('+');
            string.push(str_op);
            recurse(index + 1, current_operand, 0, value + current_operand, string, answers)
            string.pop();
            string.pop();

            // Can subtract or multiply only if there are some previous operands
            if (string.length) {
                // SUBTRACTION
                string.push('-');
                string.push(str_op);
                recurse(index + 1, -current_operand, 0, value - current_operand, string, answers);
                string.pop();
                string.pop();

                // MULTIPLICATION
                string.push('*');
                string.push(str_op);
                recurse(index + 1, current_operand * prev_operand, 0, value - prev_operand + (current_operand * prev_operand), string, answers);
                string.pop();
                string.pop();
            }
        }
        recurse(0, 0, 0, 0, [], answers);
        return answers;
    }
}

class GenerateIPAddresses extends Contract {
    /*
    Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:
    10196184245

    Note that an octet cannot begin with a '0' unless the number itself is actually 0. For example, '192.168.010.1' is not a valid IP.

    Examples:

    25525511135 -> [255.255.11.135, 255.255.111.35]
    1938718066 -> [193.87.180.66]
    */
    solution(_input) {
        const data = String(_input);
        const len = data.length - 3;
        var res = [];

        for (let a = 0; a < 3 && a < len; ++a) {
            for (let b = 0; b < 3 && b < len - a; ++b) {
                for (let c = 0; c < 3 && c < len - a - b; ++c) {
                    const A = parseInt(data.substring(0, a + 1), 10);
                    const B = parseInt(data.substring(a + 1, a + b + 2), 10);
                    const C = parseInt(data.substring(a + b + 2, a + b + c + 3), 10);
                    const D = parseInt(data.substring(a + b + c + 3), 10);

                    if (A < 256 && B < 256 && C < 256 && D < 256)
                        res.push(A + "." + B + "." + C + "." + D);
                }
            }
        }

        return res;
    }
}

class Proper2ColoringOfAGraph extends Contract {
    solution(input) {
        // You are given the following data, representing a graph:
        //         [9, [[3, 5], [2, 3], [1, 7], [7, 8], [2, 8], [5, 8], [2, 3], [4, 7], [6, 8], [4, 5], [1, 6]]]
        //  Note that "graph", as used here, refers to the field of graph theory, and has no relation to statistics or
        // plotting.The first element of the data represents the number of vertices in the graph. 
        // Each vertex is a unique number between 0 and 8. The next element of the data represents the edges of the
        // graph. Two vertices u, v in a graph are said to be adjacent if there exists an edge[u, v]. 
        // Note that an edge[u, v] is the same as an edge[v, u], as order does not matter.
        // You must construct a 2 - coloring of the graph, meaning that you have to assign each vertex in the
        // graph a "color", either 0 or 1, such that no two adjacent vertices have the same color.
        // Submit your answer in the form of an array, where element i represents the color of vertex i.
        // If it is impossible to construct a 2 - coloring of the given graph, instead submit an empty array.

        //             Examples:

        //         Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
        //         Output: [0, 0, 1, 1]

        //         Input: [3, [[0, 1], [0, 2], [1, 2]]]
        //         Output: []
        function buildGraph(input) {
            const graph = {};
            for (let i = 0; i < input[0]; i++) {
                graph[i] = {
                    "id": i,
                    "color": undefined,
                    "adjacents": []
                };
            }
            for (let i = 0; i < input[1].length; i++) {
                const description = input[1][i];
                const vertex = description[0];
                const edge = description[1];
                graph[vertex].adjacents.push(edge);
                graph[edge].adjacents.push(vertex);
            }
            return graph;
        }
        function adjacentColors(graph, node) {
            return node.adjacents.map((adjacent) => {
                return graph[adjacent].color;
            });
        }
        function firstAvailableColor(usedColors) {
            for (const color of [0, 1]) {
                if (!usedColors.includes(color)) {
                    return color;
                }
            }
            return null;
        }
        function color(input) {
            const graph = buildGraph(input);
            for (let i = 0; i < input[0]; i++) {
                const start = graph[i];
                if (start.color === undefined) {
                    const queue = [];
                    queue.push(start);
                    while (queue.length) {
                        const node = queue.shift();
                        const usedColors = adjacentColors(graph, node);
                        const availableColor = firstAvailableColor(usedColors);
                        if (availableColor === null) {
                            return [];
                        } else {
                            node.color = availableColor;
                        }
                        for (let j = 0; j < node.adjacents.length; j++) {
                            const adjacent = graph[node.adjacents[j]];
                            if (adjacent.color === undefined) {
                                queue.push(graph[node.adjacents[j]]);
                            }
                        }
                    }
                }
            }
            return graph;
        }
        const colorizedGraph = color(input);
        const colors = [];
        for (const [id, node] of Object.entries(colorizedGraph)) {
            colors.push(node.color);
        }
        // Remove line below when this issue is resolved: https://github.com/danielyxie/bitburner/issues/3755
        // Code: https://github.com/danielyxie/bitburner/blob/dev/src/data/codingcontracttypes.ts#L1387
        if (colors.length == 0) return "[]";
        return colors;
    }
}

class SanitizeParenthesesInExpression extends Contract {
    /**
     * @param {string} input
     * @returns {string[]}
     */
    solution(input) {
        // "()())()" -> [()()(), (())()]
        // "(a)())()" -> [(a)()(), (a())()]
        // "(()" -> fix(0, ())
        // ")(" -> [""]

        // ((())() -> [(())]
        // ))(((((a())aa))a))( -> (((((a())aa))a))

        /**
         * @param {string} string
         * @returns {string}
         */
        function trim(string) {
            while (string.startsWith(')')) {
                string = string.substring(1);
            }
            while (string.endsWith('(')) {
                string = string.substring(0, string.length - 1);
            }
            return string;
        }
        /**
         * @param {string} string
         * @returns {boolean}
         */
        function valid(string) {
            let openings = 0;
            for (let i = 0; i < string.length; i++) {
                const element = string[i];
                if (element === "(") {
                    openings += 1;
                } else if (element === ")") {
                    openings -= 1;
                }
                if (openings < 0) {
                    return false;
                }
            }
            return openings === 0;
        }
        /**
         * @param {int} fixes
         * @param {string} char needs to be removed ")" or "("
         * @param {string} string with input data
         * @param {string[]} solutions will be populated
         * @returns {string|null}
         */
        function fix(opening, closing, string, solutions) {
            if (opening === 0 && closing === 0) {
                if (valid(string)) {
                    return string;
                } else {
                    return null;
                }
            }
            // Negative remove ) Positive remove (
            let char = ")";
            if (opening > 0) {
                char = "(";
            } else if (closing > 0) {
                char = ")";
            }

            for (let i = 0; i < string.length; i++) {
                const element = string[i];
                if (element === char) {
                    const newString = string.slice(0, i) + string.slice(i + 1);
                    let solution;
                    if (opening > 0) {
                        solution = fix(opening - 1, closing, newString, solutions)
                    } else if (closing > 0) {
                        solution = fix(opening, closing - 1, newString, solutions)
                    }
                    if (solution !== null && !solutions.includes(solution)) {
                        solutions.push(solution);
                    }
                }
            }
            return null;
        }

        input = trim(input);
        if (valid(input) || !input.length) {
            return [input];
        }
        let openings = 0;
        let closings = 0;
        for (let i = 0; i < input.length; i++) {
            const element = input[i];
            if (element === "(") {
                openings += 1;
            } else if (element === ")") {
                if (openings > 0) {
                    openings -= 1;
                } else {
                    closings += 1;
                }
            }
        }
        const solutions = [];
        const solution = fix(openings, closings, input, solutions);
        if (solution !== null && !solutions.includes(solution)) {
            solutions.push(solution);
        }
        if (solutions.length === 0) {
            solutions.push("");
        }
        return solutions;
    }
}

class ArrayJumpingGame extends Contract {
    solution(input) {
        if (input.length <= 1) return 1;
        // 9, 0, 0, 9, 7, 0, 5, 0, 0, 8, 0, 6, 6, 2, 0, 9
        function jump(start, jumpsleft, array) {
            if (start + jumpsleft >= array.length) {
                return 1;
            }
            for (let jumpSize = 1; jumpSize <= jumpsleft; jumpSize++) {
                if (array[start + jumpSize] === 0) continue;
                const reachEnd = jump(start + jumpSize, array[start + jumpSize], array);
                if (reachEnd) return 1;
            }
            return 0;
        }
        return jump(0, input[0], input);
    }

}

class MinimumPathSumInATriangle extends Contract {
    /**
     * Given a triangle, find the minimum path sum from top to bottom. In each step of the path, you may only move to adjacent numbers in the row below. The triangle is represented as a 2D array of numbers:
        [
              [4],
             [8,4],
            [2,9,7]
        ]

        Example: If you are given the following triangle:

        [
            [2],
           [3,4],
          [6,5,7],
         [4,1,8,3]
        ]

        The minimum path sum is 11 (2 -> 3 -> 5 -> 1).
     */
    node(value, row, column, pathCost, path) {
        return {
            "value": value,
            "row": row,
            "column": column,
            "pathCost": pathCost,
            "path": path,
            "done": false
        };
    }
    solution(triangle) {
        const queue = [];
        const lastRow = triangle.length - 1;
        let shortestPath = Infinity;
        queue.push(this.node(triangle[0][0], 0, 0, triangle[0][0], []));

        while (queue.length) {
            const current = queue.shift();
            current.path.push(current.value);
            if (current.row === lastRow) {
                shortestPath = Math.min(shortestPath, current.pathCost);
                continue;
            }

            const leftColumn = Math.max(0, current.column)
            const rightColumn = Math.min(triangle[current.row + 1].length - 1, current.column + 1)
            const left = this.node(triangle[current.row + 1][leftColumn],
                current.row + 1,
                leftColumn,
                current.pathCost + triangle[current.row + 1][leftColumn],
                current.path);
            const right = this.node(triangle[current.row + 1][rightColumn],
                current.row + 1,
                rightColumn,
                current.pathCost + triangle[current.row + 1][rightColumn],
                current.path);
            const adjacents = [left, right];
            for (const adjacent of adjacents) {
                queue.push(adjacent);
            }
        }
        return shortestPath;
    }
}

class AlgorithmicStockTraderII extends Contract {
    solution(input) {
        return new AlgorithmicStockTraderIV(this.ctx,
            this.server,
            this.filename,
            this.type, this,
            this.triesRemaining,
            this.description,
            input).solution([999, input]);
    }
}

class AlgorithmicStockTraderIII extends Contract {
    solution(input) {
        return new AlgorithmicStockTraderIV(this.ctx,
            this.server,
            this.filename,
            this.type, this,
            this.triesRemaining,
            this.description,
            input).solution([2, input]);
    }
}

class AlgorithmicStockTraderIV extends Contract {
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
    solution(input) {
        let i, j, k;

        let maxTrades = input[0];
        let stockPrices = input[1];

        let highestProfit = [];
        for (let i = 0; i < maxTrades; i++) {
            highestProfit.push([]);
            for (let j = 0; j < stockPrices.length; j++) {
                highestProfit[i].push(0);
            }
        }

        for (i = 0; i < maxTrades; i++) {
            for (j = 0; j < stockPrices.length; j++) { // Buy / Start
                for (k = j; k < stockPrices.length; k++) { // Sell / End
                    if (i > 0 && j > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                    } else if (i > 0 && j > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
                    } else if (i > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                    } else if (j > 0 && k > 0) {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
                    } else {
                        highestProfit[i][k] = Math.max(highestProfit[i][k], stockPrices[k] - stockPrices[j]);
                    }
                }
            }
        }
        return highestProfit[maxTrades - 1][stockPrices.length - 1];
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