import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Inventory({ inventory, consumables, onSell, onSellAll, onUseConsumable }) {
    const [selectedItems, setSelectedItems] = useState({});
    const [activeTab, setActiveTab] = useState('items'); // 'items' or 'consumables'

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
        <div className="inventory">
            <div className="inventory-header">
                <h2>🎒 인벤토리</h2>
                {activeTab === 'items' && !isEmpty && (
                    <button
                        className="sell-all-btn"
                        onClick={onSellAll}
                    >
                        전체 판매 (💰 {calculateTotalValue()})
                    </button>
                )}
            </div>

            <div className="inventory-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button
                    onClick={() => setActiveTab('items')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'items' ? '#00b894' : '#dfe6e9',
                        color: activeTab === 'items' ? 'white' : '#636e72',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    식물 ({Object.values(inventory).reduce((sum, i) => sum + i.count, 0)})
                </button>
                <button
                    onClick={() => setActiveTab('consumables')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: activeTab === 'consumables' ? '#e17055' : '#dfe6e9',
                        color: activeTab === 'consumables' ? 'white' : '#636e72',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    소모품
                </button>
            </div>

            {activeTab === 'items' ? (
                <div className="inventory-grid">
                    <AnimatePresence>
                        {isEmpty ? (
                            <div className="empty-inventory">
                                <p>수확한 식물이 없습니다.</p>
                                <p>식물을 키워서 수확해보세요!</p>
                            </div>
                        ) : (
                            Object.values(inventory).map((item) => (
                                <motion.div
                                    key={item.emoji}
                                    className={`inventory-item rarity-${item.rarity}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    layout
                                >
                                    <div className="item-icon">{item.emoji}</div>
                                    <div className="item-details">
                                        <div className="item-name" style={{ color: 'black' }}>{item.name}</div>
                                        <div className="item-count">x{item.count}</div>
                                        <div className="item-value">💰 {item.value}</div>
                                    </div>

                                    <div className="sell-controls">
                                        <input
                                            type="range"
                                            min="1"
                                            max={item.count}
                                            value={selectedItems[item.emoji] || 1}
                                            onChange={(e) => handleSliderChange(item.emoji, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <button
                                            className="sell-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const amount = selectedItems[item.emoji] || 1;
                                                onSell(item.emoji, amount);
                                                setSelectedItems(prev => ({ ...prev, [item.emoji]: 1 }));
                                            }}
                                        >
                                            판매 ({selectedItems[item.emoji] || 1}개)
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="inventory-grid">
                    {(!consumables || (consumables.seedBomb === 0 && consumables.growthPotion === 0)) ? (
                        <div className="empty-inventory">
                            <p>보유한 소모품이 없습니다.</p>
                            <p>상점에서 구매해보세요!</p>
                        </div>
                    ) : (
                        <>
                            {consumables.seedBomb > 0 && (
                                <div className="inventory-item" style={{ borderColor: '#e17055' }}>
                                    <div className="item-icon">💣</div>
                                    <div className="item-details">
                                        <div className="item-name" style={{ color: 'black' }}>씨앗 폭탄</div>
                                        <div className="item-count">x{consumables.seedBomb}</div>
                                        <div className="item-desc" style={{ fontSize: '0.8em', color: '#636e72' }}>빈 땅 채우기</div>
                                    </div>
                                    <button
                                        className="sell-btn"
                                        style={{ background: '#e17055' }}
                                        onClick={() => onUseConsumable('seedBomb')}
                                    >
                                        사용하기
                                    </button>
                                </div>
                            )}
                            {consumables.growthPotion > 0 && (
                                <div className="inventory-item" style={{ borderColor: '#6c5ce7' }}>
                                    <div className="item-icon">🧪</div>
                                    <div className="item-details">
                                        <div className="item-name" style={{ color: 'black' }}>성장 물약</div>
                                        <div className="item-count">x{consumables.growthPotion}</div>
                                        <div className="item-desc" style={{ fontSize: '0.8em', color: '#636e72' }}>즉시 성장</div>
                                    </div>
                                    <button
                                        className="sell-btn"
                                        style={{ background: '#6c5ce7' }}
                                        onClick={() => onUseConsumable('growthPotion')}
                                    >
                                        사용하기
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
