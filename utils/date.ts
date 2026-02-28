/**
 * 날짜를 YYYY/MM/DD 형태로 포맷합니다.
 */
export function formatDateYMD(date: Date | string | number): string {
    const d = new Date(date);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 시간을 HH:MM 형태로 포맷합니다.
 */
export function formatTime(date: Date | string | number): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
