/** 터치 영역 확장용 기본 hitSlop */
export const HIT_SLOP_DEFAULT = { top: 10, bottom: 10, left: 10, right: 10 } as const;

/** 바텀 시트 하단 패딩 (safe area 포함) */
export function getBottomSheetPadding(insets: { bottom?: number } | undefined): number {
    return (insets?.bottom ?? 0) + 32;
}
