export type BookStatus = 'TO_READ' | 'READING' | 'FINISHED' | 'CANCELLED';

export interface BookStatusOption {
    value: BookStatus;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export const BOOK_STATUS_OPTIONS: BookStatusOption[] = [
    {
        value: 'TO_READ',
        label: '읽을 예정',
        color: '#64748b',
        bgColor: 'rgba(100, 116, 139, 0.1)',
        borderColor: 'rgba(100, 116, 139, 0.2)',
    },
    {
        value: 'READING',
        label: '읽는 중',
        color: '#306ee8',
        bgColor: 'rgba(48, 110, 232, 0.1)',
        borderColor: 'rgba(48, 110, 232, 0.2)',
    },
    {
        value: 'FINISHED',
        label: '완독',
        color: '#16a34a',
        bgColor: 'rgba(22, 163, 74, 0.1)',
        borderColor: 'rgba(22, 163, 74, 0.2)',
    },
    {
        value: 'CANCELLED',
        label: '중단',
        color: '#dc2626',
        bgColor: 'rgba(220, 38, 38, 0.1)',
        borderColor: 'rgba(220, 38, 38, 0.2)',
    },
];

export const getStatusOption = (status: string): BookStatusOption =>
    BOOK_STATUS_OPTIONS.find((o) => o.value === status) ?? BOOK_STATUS_OPTIONS[0];

export const getStatusLabel = (status: string): string =>
    BOOK_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

/** 생성 시 표시할 옵션 (취소함 제외) */
export const getStatusOptionsForCreate = (): BookStatusOption[] =>
    BOOK_STATUS_OPTIONS.filter((o) => o.value !== 'CANCELLED');

/** 라이브러리 필터 옵션 (전체 + 읽는 중, 완료, 취소) */
export const LIBRARY_FILTER_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: '전체' },
    ...BOOK_STATUS_OPTIONS.filter((o) => o.value !== 'TO_READ').map((o) => ({ value: o.value, label: o.label })),
];
