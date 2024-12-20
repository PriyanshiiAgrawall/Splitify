export function convertToCurrency(number) {
    number = Math.abs(Math.round((number + Number.EPSILON) * 100) / 100)
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //ragex to add commas on thousand, lakh etc
}

export function currencyFind(currencyType) {
    switch (currencyType) {
        case "INR":
            return '₹'
        case "USD":
            return '$'
        case "EUR":
            return "€"
        default:
            return '₹'
    }
}

export const monthNamesMMM = ["JAN", "FRB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

export function getMonthMMM(expDate) {
    const date = new Date(expDate)
    return monthNamesMMM[date.getMonth()];
}