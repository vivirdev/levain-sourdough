import { useCallback } from 'react';

export const useHaptic = () => {
    const trigger = useCallback((softer: boolean = false) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(softer ? 10 : 20);
        }
    }, []);

    return trigger;
};
