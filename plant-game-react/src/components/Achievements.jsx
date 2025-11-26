import React from 'react';
import { motion } from 'framer-motion';
import achievementData from '../data/achievements.json';

export function Achievements({ stats, achievements, onClaim }) {
    const sortedAchievements = [...achievementData.achievements].sort((a, b) => {
        const aState = achievements[a.id];
        const bState = achievements[b.id];

        // Sort order: Unlocked (Unclaimed) > Locked > Claimed
        const getScore = (state) => {
            if (!state) return 2; // Locked
            if (state.unlocked && !state.claimed) return 1; // Unlocked
            return 3; // Claimed
        };

        return getScore(aState) - getScore(bState);
    });

    return (
        <div className="achievements-container">
            <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '15px',
                borderRadius: '16px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: '0 0 15px 0', color: '#2d3436', textAlign: 'center' }}>
                    🏆 업적 ({Object.values(achievements).filter(a => a.unlocked).length}/{achievementData.achievements.length})
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sortedAchievements.map(ach => {
                        const state = achievements[ach.id];
                        const isUnlocked = state?.unlocked;
                        const isClaimed = state?.claimed;
                        const currentProgress = stats[ach.condition.type] || 0;
                        const target = ach.condition.value;
                        const progressPercent = Math.min((currentProgress / target) * 100, 100);

                        return (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: isClaimed ? '#f1f2f6' : 'white',
                                    border: isUnlocked && !isClaimed ? '2px solid #f1c40f' : '1px solid #dfe6e9',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    opacity: !isUnlocked ? 0.8 : 1,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Progress Bar Background for Locked Items */}
                                {!isUnlocked && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        height: '4px',
                                        width: `${progressPercent}%`,
                                        background: '#00b894',
                                        transition: 'width 0.5s ease'
                                    }} />
                                )}

                                <div style={{
                                    fontSize: '2em',
                                    filter: !isUnlocked ? 'grayscale(100%)' : 'none'
                                }}>
                                    {ach.icon}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: 'bold',
                                        color: isUnlocked ? '#2d3436' : '#636e72',
                                        marginBottom: '4px'
                                    }}>
                                        {ach.title}
                                        {isClaimed && <span style={{ marginLeft: '5px', fontSize: '0.8em', color: '#00b894' }}>✅ 완료</span>}
                                    </div>
                                    <div style={{ fontSize: '0.9em', color: '#636e72' }}>
                                        {ach.description}
                                    </div>
                                    {!isUnlocked && (
                                        <div style={{ fontSize: '0.8em', color: '#b2bec3', marginTop: '4px' }}>
                                            진행도: {currentProgress.toLocaleString()} / {target.toLocaleString()} ({Math.floor(progressPercent)}%)
                                        </div>
                                    )}
                                </div>

                                <div>
                                    {isUnlocked && !isClaimed ? (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => onClaim(ach.id)}
                                            style={{
                                                background: '#f1c40f',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                color: '#2d3436',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            보상 받기
                                            <div style={{ fontSize: '0.8em', marginTop: '2px' }}>
                                                💰 {ach.reward.value}
                                            </div>
                                        </motion.button>
                                    ) : (
                                        <div style={{
                                            background: '#dfe6e9',
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.8em',
                                            color: '#636e72',
                                            textAlign: 'center',
                                            minWidth: '60px'
                                        }}>
                                            {isClaimed ? '수령완료' : `💰 ${ach.reward.value}`}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
