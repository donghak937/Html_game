import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                <h2 style={{ color: '#2d3436', margin: 0 }}>?éí ?∏Î≤§?†Î¶¨</h2>
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
                            cursor: 'pointer'
                        }}
                    >
                        ?ÑÏ≤¥ ?êÎß§ (?í∞ {calculateTotalValue()})
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px',
                                                     alignItems: 'center', marginBottom: '20px' }}>
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
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    ?å± ?ùÎ¨º ({Object.values(inventory).reduce((sum, i) => sum + i.count, 0)})
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
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    ?éí ?åÎ™®??({(consumables?.seedBomb || 0) + (consumables?.growthPotion || 0)})
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
                                    <div style={{ fontSize: '4em', marginBottom: '10px' }}>?åæ</div>
                                    <p style={{ fontSize: '1.1em', margin: 0 }}>?òÌôï???ùÎ¨º???ÜÏäµ?àÎã§</p>
                                    <p style={{ fontSize: '0.9em', color: '#b2bec3' }}>?ùÎ¨º???§Ïõå???òÌôï?¥Î≥¥?∏Ïöî!</p>
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
                                            border: '2px solid #dfe6e9'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ fontSize: '3em' }}>{item.emoji}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
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
                                                    <span>?í∞ {item.value}</span>
                                                    <span style={{
                                                       background: '#00b894',
                                                       color: 'white',
                                                       padding: '4px 10px',
                                                       borderRadius: '12px',
                                                       fontSize: '0.95em',
                                                       fontWeight: 'bold'
                                                     }}>? {item.count}</span>
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
                                                     alignItems: 'center',
                                                marginBottom: '8px'
                                            }}>
                                                <span style={{ fontSize: '0.9em', color: '#636e72', minWidth: '60px', flexShrink: 0 }}>
                                                    {selectedItems[item.emoji] || 1}Í∞??†ÌÉù
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
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ?êÎß§ (?í∞ {item.value * (selectedItems[item.emoji] || 1)})
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
                                <div style={{ fontSize: '4em', marginBottom: '10px' }}>?éí</div>
                                <p style={{ fontSize: '1.1em', margin: 0 }}>Î≥¥Ïú†???åÎ™®?àÏù¥ ?ÜÏäµ?àÎã§</p>
                                <p style={{ fontSize: '0.9em', color: '#b2bec3' }}>?ÅÏ†ê?êÏÑú Íµ¨Îß§?¥Î≥¥?∏Ïöî!</p>
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
                                            <div style={{ fontSize: '3em' }}>?í£</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    color: '#2d3436',
                                                    marginBottom: '4px'
                                                }}>
                                                    ?®Ïïó ??ÉÑ
                                                </div>
                                                <div style={{ fontSize: '0.9em', color: '#636e72' }}>
                                                    x{consumables.seedBomb}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid #dfe6e9', paddingTop: '15px' }}>
                                            <p style={{ fontSize: '0.85em', color: '#636e72', margin: '0 0 10px 0' }}>
                                                Îπ??ÖÏóê ?ùÎ¨º??Í∞Ä??Ï±ÑÏõÅ?àÎã§
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
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ?¨Ïö©?òÍ∏∞
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
                                            <div style={{ fontSize: '3em' }}>?ß™</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontSize: '1.1em',
                                                    fontWeight: 'bold',
                                                    color: '#2d3436',
                                                    marginBottom: '4px'
                                                }}>
                                                    ?±Ïû• Î¨ºÏïΩ
                                                </div>
                                                <div style={{ fontSize: '0.9em', color: '#636e72' }}>
                                                    x{consumables.growthPotion}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ borderTop: '1px solid #dfe6e9', paddingTop: '15px' }}>
                                            <p style={{ fontSize: '0.85em', color: '#636e72', margin: '0 0 10px 0' }}>
                                                Î™®Îì† ?ùÎ¨º??Ï¶âÏãú ?±Ïû•?úÌÇµ?àÎã§
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
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ?¨Ïö©?òÍ∏∞
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
