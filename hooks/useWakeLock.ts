import { useEffect, useRef, useState, useCallback } from 'react';

const useWakeLock = () => {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);
    const [isLocked, setIsLocked] = useState(false);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                const wakeLock = await navigator.wakeLock.request('screen');
                wakeLockRef.current = wakeLock;
                setIsLocked(true);

                wakeLock.addEventListener('release', () => {
                    setIsLocked(false);
                });
                console.log('Wake Lock active');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
                setIsLocked(false);
            }
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                setIsLocked(false);
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    }, []);

    // Re-request lock when page visibility changes (tabs/minimizing releases it)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        requestWakeLock(); // Initial request

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            releaseWakeLock();
        };
    }, [requestWakeLock, releaseWakeLock]);

    return { isLocked, requestWakeLock, releaseWakeLock };
};

export default useWakeLock;
