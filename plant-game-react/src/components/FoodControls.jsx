import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function FoodControls({ gold, foodState, onActivateFood, onCancelFood }) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!foodState.active) return;

        const interval = setInterval(() => {
            const remaining = Math.max(0, foodState.endTime - Date.now());
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [foodState]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        if (!foodState.active) return 0;
        const totalDuration = {
            '3min-free': 180000,
            '1min': 60000,
            '5min': 300000,
            '10min': 600000
        }[foodState.type];
        return (timeLeft / totalDuration) * 100;
    };

    if (foodState.active) {
        return (
            <div className="food-system" style={{
                background: 'rgba(255,255,255,0.8)',
                padding: '15px',
                borderRadius: '16px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#d35400' }}>🧪 비료 활성</span>
                    <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>{formatTime(timeLeft)}</span>
                </div>

                <div style={{ height: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{
                        height: '100%',
                        width: `${getProgress()}%`,
                        background: 'linear-gradient(90deg, #10ac84, #1dd1a1)',
                        transition: 'width 0.1s linear'
                    }} />
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={onCancelFood}
                    style={{ width: '100%', padding: '8px' }}
                >
                    ❌ 비료 취소
                </button>
            </div>
        );
    }

    const foodOptions = [
        { id: '3min-free', name: '🆓 3분 무료', info: '느림 (0.5x)', cost: 0, color: 'linear-gradient(135deg, #a8e6cf 0%, #3dccc7 100%)' },
        { id: '1min', name: '⚡ 1분 속도', info: '빠름 (2x)', cost: 200, color: 'linear-gradient(135deg, #ff9a9e 0%, #ff6b6b 100%)' },
        { id: '5min', name: '🌱 5분 보통', info: '보통 (1x)', cost: 150, color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
        { id: '10min', name: '🌳 10분 장기', info: '느림 (0.7x)', cost: 350, color: 'linear-gradient(135deg, #95e1d3 0%, #38ada9 100%)' }
    ];

    return (
        <div className="food-system" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                {foodOptions.map(option => (
                    <motion.button
                        key={option.id}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onActivateFood(option.id)}
                        disabled={gold < option.cost}
                        style={{
                            flex: '1',
                            minWidth: '100px',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px',
                            background: option.color,
                            color: 'white',
                            cursor: 'pointer',
                            opacity: gold < option.cost ? 0.5 : 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{option.name}</div>
                        <div style={{ fontSize: '0.7em', opacity: 0.9 }}>{option.info}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.8em' }}>{option.cost === 0 ? '무료' : `💰 ${option.cost}`}</div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
