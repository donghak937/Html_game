import React from 'react';
import { motion } from 'framer-motion';

export function Inventory({ inventory, onSell, onSellAll }) {
    const items = Object.values(inventory);


    return (
        <div className="inventory-container">
            <div className="controls" style={{ marginBottom: '15px' }}>
                <button className="btn" onClick={onSellAll}>💰 전부 판매</button>
            </div>

            {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#636e72' }}>
                    <div style={{ fontSize: '3em', marginBottom: '10px' }}>🎒</div>
                    인벤토리가 비어있습니다
                </div>
            ) : (
                <div className="inventory-grid">
                    {items.map((item) => (
                        <motion.div
                            key={item.emoji}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inventory-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSell(item.emoji);
                            }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="item-icon">{item.emoji}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9em', color: 'black' }}>{item.description}</div>
                            <div style={{ fontSize: '0.8em', color: '#636e72' }}>💰 {item.value}</div>
                            <div className="item-count">x{item.count}</div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
