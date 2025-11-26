import React, { useState } from 'react';
import { motion } from 'framer-motion';
import mushroomData from '../data/mushroom_types.json';

export function Collection({ collection, rarityLevel = 1, activeBuffs = [] }) {
    const [filter, setFilter] = useState('all');
    const [selectedPlant, setSelectedPlant] = useState(null);

    const allMushrooms = mushroomData.mushrooms;
    const discoveredCount = Object.values(collection).filter(c => c.discovered).length;
    const totalCount = allMushrooms.length;
    const completionPercentage = ((discoveredCount / totalCount) * 100).toFixed(1);

    const filteredMushrooms = allMushrooms.filter(mushroom => {
        const isDiscovered = collection[mushroom.emoji]?.discovered;
        if (filter === 'all') return true;
        if (filter === 'discovered') return isDiscovered;
        if (filter === 'undiscovered') return !isDiscovered;
        return mushroom.rarity === filter;
    });

    const getRarityColor = (rarity) => {
        const colors = {
            'common': '#95a5a6',
            'rare': '#3498db',
            'epic': '#9b59b6',
            'legendary': '#f39c12',
            'mythic': '#e74c3c'
        };
        return colors[rarity] || '#95a5a6';
    };

    const getRarityName = (rarity) => {
        const names = {
            'common': '일반',
            'rare': '레어',
            'epic': '에픽',
            'legendary': '레전더리',
            'mythic': '신화'
        };
        return names[rarity] || '알 수 없음';
    };

    const getProbability = (plant) => {
        const rarityBuffs = activeBuffs.filter(b => b.type === 'rarity_boost');

        // Calculate total weight for all available mushrooms
        const weightedMushrooms = allMushrooms
            .filter(m => {
                if (m.rarity === 'epic' && rarityLevel < 5) return false;
                if (m.rarity === 'legendary' && rarityLevel < 10) return false;
                if (m.rarity === 'mythic' && rarityLevel < 15) return false;
                return true;
            })
            .map(m => {
                let weightMultiplier = 1;
                rarityBuffs.forEach(buff => {
                    if (buff.target === 'all' && m.rarity !== 'common') {
                        weightMultiplier *= buff.value;
                    } else if (buff.target === m.rarity) {
                        weightMultiplier *= buff.value;
                    }
                });

                return {
                    ...m,
                    effectiveWeight: m.rarity === 'common'
                        ? m.weight / (1 + rarityLevel * 0.15)
                        : m.weight * (1 + (rarityLevel - 1) * 0.8) * weightMultiplier
                };
            });

        const totalWeight = weightedMushrooms.reduce((sum, m) => sum + m.effectiveWeight, 0);
        const plantInWeighted = weightedMushrooms.find(m => m.emoji === plant.emoji);

        if (!plantInWeighted) return "0.00";
        return ((plantInWeighted.effectiveWeight / totalWeight) * 100).toFixed(2);
    };

    return (
        <div className="collection-container">
            {/* Completion Stats */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#2d3436' }}>도감 완성도</span>
                    <span style={{ fontWeight: 'bold', color: '#6c5ce7' }}>{completionPercentage}%</span>
                </div>
                <div style={{ height: '10px', background: '#dfe6e9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${completionPercentage}%`,
                        background: 'linear-gradient(90deg, #6c5ce7, #a29bfe)',
                        transition: 'width 0.5s ease-out'
                    }} />
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '20px',
                justifyContent: 'center'
            }}>
                {['all', 'discovered', 'undiscovered', 'common', 'rare', 'epic', 'legendary', 'mythic'].map(f => {
                    const labels = {
                        all: '전체',
                        discovered: '발견함',
                        undiscovered: '미발견',
                        common: '일반',
                        rare: '레어',
                        epic: '에픽',
                        legendary: '레전더리',
                        mythic: '신화'
                    };
                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: 'none',
                                background: filter === f ? '#6c5ce7' : '#dfe6e9',
                                color: filter === f ? 'white' : '#636e72',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontWeight: 'bold',
                                fontSize: '0.9em'
                            }}
                        >
                            {labels[f]}
                        </button>
                    );
                })}
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '10px',
                maxHeight: '400px',
                overflowY: 'auto',
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none' /* IE and Edge */
            }}
                className="collection-grid">
                {filteredMushrooms.map(mushroom => {
                    const data = collection[mushroom.emoji];
                    const isDiscovered = data?.discovered;

                    return (
                        <motion.div
                            key={mushroom.emoji}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => isDiscovered && setSelectedPlant({ ...mushroom, collectionData: data })}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '15px',
                                textAlign: 'center',
                                border: `2px solid ${getRarityColor(mushroom.rarity)}`,
                                boxShadow: isDiscovered ? `0 0 15px ${getRarityColor(mushroom.rarity)}40` : 'none',
                                opacity: isDiscovered ? 1 : 0.5,
                                cursor: isDiscovered ? 'pointer' : 'default'
                            }}
                        >
                            <div style={{ fontSize: '2.5em', marginBottom: '5px', position: 'relative' }}>
                                {isDiscovered ? mushroom.emoji : '❓'}
                                {isDiscovered && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        fontSize: '0.5em'
                                    }}>
                                        {data.count >= 50 ? '🥇' : data.count >= 40 ? '🥈' : data.count >= 30 ? '🥉' : ''}
                                    </div>
                                )}
                            </div>
                            <div className="text-black" style={{ fontSize: '0.8em', fontWeight: 'bold' }}>
                                {isDiscovered ? mushroom.description : '???'}
                            </div>
                            {isDiscovered && (
                                <div style={{ fontSize: '0.7em', color: '#636e72', marginTop: '5px' }}>
                                    수확: {data.count}번
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Description Modal */}
            {selectedPlant && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedPlant(null)}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '30px',
                            maxWidth: '90%',
                            width: '400px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: '4em', textAlign: 'center', marginBottom: '15px' }}>
                            {selectedPlant.emoji}
                        </div>
                        <div className="text-black" style={{ fontSize: '1.5em', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px', wordBreak: 'keep-all' }}>
                            {selectedPlant.description}
                        </div>
                        <div style={{
                            background: getRarityColor(selectedPlant.rarity),
                            color: 'white',
                            padding: '8px 15px',
                            borderRadius: '20px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            marginBottom: '20px'
                        }}>
                            {getRarityName(selectedPlant.rarity)}
                        </div>
                        <div className="text-black" style={{ marginBottom: '15px', lineHeight: '1.6', fontSize: '0.95em' }}>
                            {selectedPlant.flavorText}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8em', color: '#2d3436', marginBottom: '5px' }}>가치</div>
                                <div style={{ fontWeight: 'bold', color: '#2d3436' }}>💰 {selectedPlant.value}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8em', color: '#2d3436', marginBottom: '5px' }}>등장 확률</div>
                                <div style={{ fontWeight: 'bold', color: '#2d3436' }}>🎲 {getProbability(selectedPlant)}%</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.8em', color: '#2d3436', marginBottom: '5px' }}>수확 횟수</div>
                                <div style={{ fontWeight: 'bold', color: '#2d3436' }}>📈 {selectedPlant.collectionData.count}번</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedPlant(null)}
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                padding: '12px',
                                background: '#6c5ce7',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
