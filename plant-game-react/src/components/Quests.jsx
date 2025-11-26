import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function Quests({ activeQuests, questTimer, onRefresh, onComplete, inventory, cookedItems }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, questTimer - now);
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${minutes}분 ${seconds}초`);
        }, 1000);
        return () => clearInterval(interval);
    }, [questTimer]);

    const REFRESH_COST = 500;

    return (
        <div className="quests-container">
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#2d3436' }}>📜 퀘스트 게시판</h2>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.9em', color: '#636e72' }}>다음 갱신까지: {timeLeft}</div>
                        <button
                            onClick={() => onRefresh(REFRESH_COST)}
                            style={{
                                background: '#74b9ff',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.8em',
                                marginTop: '5px'
                            }}
                        >
                            🔄 즉시 갱신 ({REFRESH_COST}G)
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {activeQuests.map(quest => {
                        const req = quest.request;
                        let currentCount = 0;
                        if (req.type === 'plant') {
                            currentCount = inventory[req.id]?.count || 0;
                        } else {
                            currentCount = cookedItems[req.id]?.count || 0;
                        }

                        const isReady = currentCount >= req.count;

                        return (
                            <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                style={{
                                    background: '#fff',
                                    border: '1px solid #dfe6e9',
                                    borderRadius: '12px',
                                    padding: '15px',
                                    position: 'relative',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ fontSize: '2em' }}>{quest.npcEmoji}</div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: '#2d3436' }}>{quest.npcName}</div>
                                        <div style={{ fontSize: '0.8em', color: '#636e72', fontStyle: 'italic' }}>"{quest.dialogue}"</div>
                                    </div>
                                </div>

                                <div style={{
                                    background: '#f1f2f6',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{ fontSize: '1.5em' }}>{req.emoji}</span>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{req.name}</div>
                                            <div style={{ fontSize: '0.8em', color: isReady ? '#00b894' : '#d63031' }}>
                                                {currentCount} / {req.count}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8em', color: '#636e72' }}>보상</div>
                                        <div style={{ fontWeight: 'bold', color: '#fdcb6e' }}>💰 {quest.reward.gold}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onComplete(quest.id)}
                                    disabled={!isReady}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: isReady ? '#00b894' : '#b2bec3',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        cursor: isReady ? 'pointer' : 'not-allowed',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    {isReady ? '배달하기' : '재료 부족'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
                {activeQuests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#b2bec3' }}>
                        현재 가능한 퀘스트가 없습니다. 잠시 후 다시 확인해주세요.
                    </div>
                )}
            </div>
        </div>
    );
}
