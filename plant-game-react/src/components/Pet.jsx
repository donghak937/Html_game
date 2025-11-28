import React, { useState, useEffect } from 'react';

export function Pet({ type }) {
    const [position, setPosition] = useState({ x: 50, y: 80 });
    const [direction, setDirection] = useState(1); // 1: right, -1: left
    const [action, setAction] = useState('idle'); // idle, walk, sleep

    useEffect(() => {
        const moveInterval = setInterval(() => {
            const randomAction = Math.random();

            if (randomAction < 0.6) {
                // Walk
                setAction('walk');
                setDirection(prev => {
                    // Change direction randomly or if hitting bounds
                    if (Math.random() < 0.2) return -prev;
                    return prev;
                });

                setPosition(prev => {
                    let newX = prev.x + (direction * 5);
                    // Keep within bounds (10% to 90% width)
                    if (newX < 10) {
                        newX = 10;
                        setDirection(1);
                    } else if (newX > 90) {
                        newX = 90;
                        setDirection(-1);
                    }
                    return { ...prev, x: newX };
                });
            } else if (randomAction < 0.9) {
                // Idle
                setAction('idle');
            } else {
                // Sleep
                setAction('sleep');
            }
        }, 2000);

        return () => clearInterval(moveInterval);
    }, [direction]);

    const getEmoji = () => {
        if (type === 'dog') {
            if (action === 'sleep') return '💤 🐶';
            return '🐶';
        }
        return '❓';
    };

    return (
        <div
            style={{
                position: 'fixed',
                left: `${position.x}%`,
                bottom: `${position.y}px`,
                transform: `scaleX(${direction})`,
                transition: 'left 2s linear, bottom 2s linear, transform 0.2s',
                fontSize: '3em',
                zIndex: 90,
                pointerEvents: 'none', // Don't block clicks
                filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))'
            }}
        >
            {getEmoji()}
        </div>
    );
}
