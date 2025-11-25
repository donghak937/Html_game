import React, { useState, useEffect } from 'react';

export function BuffTimer({ endTime }) {
    const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));

    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return <span>{timeLeft}s</span>;
}
