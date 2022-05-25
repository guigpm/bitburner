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
