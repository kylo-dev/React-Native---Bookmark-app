import { useCallback } from 'react';
import { BottomSheetBackdrop, type BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

/**
 * @gorhom/bottom-sheet 모달용 공통 백드롭 렌더러
 */
export function useBottomSheetBackdrop() {
    return useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
        ),
        [],
    );
}
