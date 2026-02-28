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

/**
 * 해당 년월의 시작/종료 ISO 문자열 (로컬 타임존 기준, API 날짜 필터용)
 */
export function getMonthDateRange(year: number, month: number): { start: string; end: string } {
    return {
        start: new Date(year, month, 1).toISOString(),
        end: new Date(year, month + 1, 1).toISOString(),
    };
}

/**
 * 해당 년월이 오늘보다 미래인지 여부
 */
export function isFutureMonth(year: number, month: number): boolean {
    const today = new Date();
    return (
        year > today.getFullYear() ||
        (year === today.getFullYear() && month > today.getMonth())
    );
}

/**
 * 해당 년월이 오늘 이상인지 (다음달 버튼 비활성화용)
 */
export function isMonthAtOrAfterCurrent(year: number, month: number): boolean {
    const today = new Date();
    return (
        year > today.getFullYear() ||
        (year === today.getFullYear() && month >= today.getMonth())
    );
}
