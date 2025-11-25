import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mushroomData from '../data/mushroom_types.json';

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

export function Inventory({ inventory, consumables, onSell, onSellAll, onUseConsumable }) {
    const [selectedItems, setSelectedItems] = useState({});
    const [activeTab, setActiveTab] = useState('items');

    const handleSliderChange = (emoji, value) => {
        setSelectedItems(prev => ({
            ...prev,
            [emoji]: parseInt(value)
        }));
    };

    const calculateTotalValue = () => {
        return Object.values(inventory).reduce((sum, item) => sum + (item.value * item.count), 0);
    };

    const isEmpty = Object.keys(inventory).length === 0;

    return (
        <div style={{ padding: '20px' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <h2 style={{ color: '#2d3436', margin: 0 }}>🎒 인벤토리</h2>
                {activeTab === 'items' && !isEmpty && (
                    <button
                        onClick={onSellAll}
                        style={{
                            padding: '10px 20px',
                            background: '#00b894',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                        }}
                    >
                        전체 판매 (💰 {calculateTotalValue()})
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('items')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'items' ? '#00b894' : '#dfe6e9',
                        color: activeTab === 'items' ? 'white' : '#636e72',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    🌱 식물 ({Object.values(inventory).reduce((sum, i) => sum + i.count, 0)})
                </button>
                <button
                    onClick={() => setActiveTab('consumables')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: activeTab === 'consumables' ? '#e17055' : '#dfe6e9',
                        color: activeTab === 'consumables' ? 'white' : '#636e72',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    🎒 소모품 ({(consumables?.seedBomb || 0) + (consumables?.growthPotion || 0)})
                </button>
            </div>

            {/* Content */}
            <div style={{
                maxHeight: '600px',
                overflowY: 'auto',
                paddingRight: '10px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
                {activeTab === 'items' ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '15px'
                    }}>
                        <AnimatePresence>
                            {isEmpty ? (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: '#636e72'
                                }}>
                                    <div style={{ fontSize: '4em', marginBottom: '10px' }}>🌾</div>
                                    <p style={{ fontSize: '1.1em', margin: 0 }}>수확한 식물이 없습니다</p>
                                    <p style={{ fontSize: '0.9em', color: '#b2bec3' }}>식물을 키워서 수확해보세요!</p>
                                </div>
                            ) : (
                                Object.values(inventory).map((item) => (
                                    <motion.div
                                        key={item.emoji}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        layout
                                        style={{
                                            background: 'white',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                            border: `2px solid ${getRarityColor(mushroomData.mushrooms.find(m => m.emoji === item.emoji)?.rarity)}`
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ fontSize: '3em' }}>{item.emoji}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    color: '#2d3436',
                                                    marginBottom: '4px'
                                                }}>
                                                    {item.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.9em',
                                                    color: '#636e72',
                                                    display: 'flex',
                                                    gap: '10px',
                                                    alignItems: 'center'
                                                }}>
                                                    <span>💰 {item.value}</span>
                                                    <span style={{
                                                        background: '#00b894',
                                                        color: 'white',
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.95em',
                                                        fontWeight: 'bold',
                                                        whiteSpace: 'nowrap'
                                                    }}>{item.name} 총 {item.count} 개</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            borderTop: '1px solid #dfe6e9',
                                            paddingTop: '15px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                marginBottom: '8px'
                                            }}>
                                                <span style={{ fontSize: '0.9em', color: '#636e72', minWidth: '60px', flexShrink: 0 }}>
                                                    {selectedItems[item.emoji] || 1}개 선택
                                                </span>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max={item.count}
                                                    value={selectedItems[item.emoji] || 1}
                                                    onChange={(e) => handleSliderChange(item.emoji, e.target.value)}
                                                    style={{ flex: 1, minWidth: 0, maxWidth: '100%' }}
                                                />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const amount = selectedItems[item.emoji] || 1;
                                                    onSell(item.emoji, amount);
                                                    setSelectedItems(prev => ({ ...prev, [item.emoji]: 1 }));
                                                }}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: '#00b894',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                판매 (💰 {item.value * (selectedItems[item.emoji] || 1)})
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '15px'
                    }}>
                        {(!consumables || (consumables.seedBomb === 0 && consumables.growthPotion === 0)) ? (
                            <div style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#636e72'
                            }}>
                                <div style={{ fontSize: '4em', marginBottom: '10px' }}>🎒</div>
                                <p style={{ fontSize: '1.1em', margin: 0 }}>보유한 소모품이 없습니다</p>
                                <p style={{ fontSize: '0.9em', color: '#b2bec3' }}>상점에서 구매해보세요!</p>
                            </div>
                        ) : (
                            <>
                                {consumables.seedBomb > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            background: 'white',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                            border: '2px solid #e17055'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ fontSize: '3em' }}>💣</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    color: '#2d3436',
                                                    marginBottom: '4px'
                                                }}>
                                                    씨앗 폭탄
                                                </div>
                                                <div style={{ fontSize: '0.9em', color: '#636e72' }}>
                                                    x{consumables.seedBomb}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid #dfe6e9', paddingTop: '15px' }}>
                                            <p style={{ fontSize: '0.85em', color: '#636e72', margin: '0 0 10px 0' }}>
                                                빈 땅에 식물을 가득 채웁니다
                                            </p>
                                            <button
                                                onClick={() => onUseConsumable('seedBomb')}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: '#e17055',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                사용하기
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                {consumables.growthPotion > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{
                                            background: 'white',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                            border: '2px solid #6c5ce7'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ fontSize: '3em' }}>🧪</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    color: '#2d3436',
                                                    marginBottom: '4px'
                                                }}>
                                                    성장 물약
                                                </div>
                                                <div style={{ fontSize: '0.9em', color: '#636e72' }}>
                                                    x{consumables.growthPotion}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid #dfe6e9', paddingTop: '15px' }}>
                                            <p style={{ fontSize: '0.85em', color: '#636e72', margin: '0 0 10px 0' }}>
                                                모든 식물을 즉시 성장시킵니다
                                            </p>
                                            <button
                                                onClick={() => onUseConsumable('growthPotion')}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: '#6c5ce7',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 'bold',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                사용하기
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


