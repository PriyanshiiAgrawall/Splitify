//transactions object look like this
// const transactions = {
//     Alice: -50,  // Alice owes $50
//     Bob: 20,     // Bob is owed $20
//     Charlie: 30  // Charlie is owed $30
// };

//Object.entries(transactions);
//this coneverts object into array and each value of that object in an array(array of array)
// [
//     ["Alice", -50],
//     ["Bob", 20],
//     ["Charlie", 30]
// ]

//now if we convert it into map for easy access
//const map = new Map(transactions);
// Map(3) {
//     "Alice" => -50,
//     "Bob" => 20,
//     "Charlie" => 30
// }

export function minimumTransactions(transactions) {
    const splits = [];
    const transactionsMap = new Map(Object.entries(transactions));

    // Step 1: Settle exact matches
    function exactMatches() {
        const visited = new Set();
        for (let person1 of transactionsMap.keys()) {
            visited.add(person1);
            for (let person2 of transactionsMap.keys()) {
                if (!visited.has(person2) && person1 !== person2) {
                    const amount1 = transactionsMap.get(person1);
                    const amount2 = transactionsMap.get(person2);
                    if (amount1 + amount2 === 0) {
                        splits.push([person1, person2, Math.abs(amount1)]);
                        transactionsMap.set(person1, 0);
                        transactionsMap.set(person2, 0);
                    }
                }
            }
        }
    }

    // Step 2: Find the person with the highest debt and the highest credit
    function maxCreditorAndMaxDebtor() {
        let maxCreditor = null,
            maxDebtor = null;
        let maxCredit = 0,
            maxDebt = 0;

        for (let [person, money] of transactionsMap.entries()) {
            if (money > 0 && money > maxCredit) {
                maxCredit = money;
                maxCreditor = person;
            }
            if (money < 0 && money < maxDebt) {
                maxDebt = money;
                maxDebtor = person;
            }
        }

        return [maxCreditor, maxDebtor, maxCredit, maxDebt];
    }

    // Step 3: Settle remaining debts between the largest debtor and creditor
    function maxSettle() {
        while (true) {
            const [maxCreditor, maxDebtor, maxCredit, maxDebt] = maxCreditorAndMaxDebtor();
            if (!maxCreditor || !maxDebtor) break; // Stop if no one owes money

            const settlement = Math.min(maxCredit, Math.abs(maxDebt));
            splits.push([maxDebtor, maxCreditor, settlement]);

            // Update balances
            transactionsMap.set(maxDebtor, maxDebt + settlement);
            transactionsMap.set(maxCreditor, maxCredit - settlement);
        }
    }

    exactMatches();
    maxSettle();

    return splits;
}



//difference between for of and for in loop



