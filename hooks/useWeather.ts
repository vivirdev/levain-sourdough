import { useState, useCallback } from 'react';

export const useWeather = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLocalTemp = useCallback(async (): Promise<number | null> => {
        setIsLoading(true);
        setError(null);

        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                setError('Geolocation is not supported');
                setIsLoading(false);
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const response = await fetch(
                            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                        );

                        if (!response.ok) throw new Error('Weather API failed');

                        const data = await response.json();
                        const temp = data.current_weather?.temperature;

                        if (typeof temp === 'number') {
                            setIsLoading(false);
                            resolve(temp);
                        } else {
                            throw new Error('Invalid data');
                        }
                    } catch (err: any) {
                        console.error(err);
                        setError('Failed to fetch weather');
                        setIsLoading(false);
                        resolve(null);
                    }
                },
                (err) => {
                    console.error(err);
                    setError('Location permission denied');
                    setIsLoading(false);
                    resolve(null);
                }
            );
        });
    }, []);

    return { getLocalTemp, isLoading, error };
};
