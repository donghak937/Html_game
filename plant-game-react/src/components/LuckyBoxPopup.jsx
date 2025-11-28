import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LuckyBoxPopup({ result, onClose }) {
    if (!result) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '20px',
                    textAlign: 'center',
                    maxWidth: '300px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    border: '4px solid #a29bfe'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ fontSize: '4em', marginBottom: '10px' }}>
                    {result.type === 'jackpot' ? '🎰' :
                        result.type === 'big_win' ? '💰' :
                            result.type === 'item' ? '🎁' :
                                result.type === 'trash' ? '💩' : '💵'}
                </div>

                <h2 style={{
                    color: result.type === 'trash' ? '#636e72' : '#2d3436',
                    marginBottom: '10px'
                }}>
                    {result.message}
                </h2>

                <div style={{
                    fontSize: '1.2em',
                    fontWeight: 'bold',
                    color: result.type === 'jackpot' ? '#e17055' : '#6c5ce7',
                    marginBottom: '20px'
                }}>
                    {result.rewardText}
                </div>

                <button
                    className="btn"
                    onClick={onClose}
                    style={{ width: '100%' }}
                >
                    확인
                </button>
            </motion.div>
        </div>
    );
}
