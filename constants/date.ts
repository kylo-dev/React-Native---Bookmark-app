export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const FULL_MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

/** 날짜를 "February 2026" 형태로 포맷 */
export function formatMonthYear(date: Date): string {
    return `${FULL_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** 날짜를 "Feb 2026" 형태로 포맷 */
export function formatMonthYearShort(date: Date): string {
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
