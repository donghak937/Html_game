import React from 'react';
import '../styles/main.css';

export default function DiscoveryPopup({ plant, onClose }) {
    if (!plant) return null;

    const rarityColors = {
        common: { bg: '#95a5a6', glow: 'rgba(149, 165, 166, 0.5)' },
        rare: { bg: '#3498db', glow: 'rgba(52, 152, 219, 0.5)' },
        epic: { bg: '#9b59b6', glow: 'rgba(155, 89, 182, 0.5)' },
        legendary: { bg: '#f39c12', glow: 'rgba(243, 156, 18, 0.5)' },
        mythic: { bg: '#e74c3c', glow: 'rgba(231, 76, 60, 0.5)' }
    };

    const rarityNames = {
        common: '일반',
        rare: '희귀',
        epic: '에픽',
        legendary: '전설',
        mythic: '신화'
    };

    const colors = rarityColors[plant.rarity] || rarityColors.common;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10000,
                animation: 'fadeIn 0.2s'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#fff',
                    borderRadius: '24px',
                    padding: '0',
                    maxWidth: '450px',
                    width: '90%',
                    textAlign: 'center',
                    boxShadow: `0 25px 100px ${colors.glow}, 0 0 0 8px rgba(255,255,255,0.1)`,
                    animation: 'scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top decoration */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '120px',
                    background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}dd 100%)`,
                    clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)'
                }} />

                {/* Sparkles */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '30px',
                    fontSize: '24px',
                    animation: 'sparkle 1.5s infinite',
                    animationDelay: '0s'
                }}>✨</div>
                <div style={{
                    position: 'absolute',
                    top: '30px',
                    right: '40px',
                    fontSize: '20px',
                    animation: 'sparkle 1.5s infinite',
                    animationDelay: '0.5s'
                }}>⭐</div>
                <div style={{
                    position: 'absolute',
                    top: '70px',
                    right: '20px',
                    fontSize: '16px',
                    animation: 'sparkle 1.5s infinite',
                    animationDelay: '1s'
                }}>✨</div>

                {/* Content */}
                <div style={{ position: 'relative', padding: '40px 30px 35px' }}>
                    {/* Plant emoji in circle */}
                    <div style={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto 20px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '70px',
                        boxShadow: `0 10px 30px ${colors.glow}, 0 0 0 4px ${colors.bg}33`,
                        animation: 'float 3s ease-in-out infinite',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {plant.emoji}
                    </div>

                    <h2 style={{
                        color: '#2c3e50',
                        margin: '0 0 8px 0',
                        fontSize: '26px',
                        fontWeight: '800',
                        letterSpacing: '-0.5px'
                    }}>
                        새로운 식물 발견!
                    </h2>

                    <div style={{
                        background: '#f8f9fa',
                        borderRadius: '16px',
                        padding: '20px',
                        margin: '20px 0'
                    }}>
                        <div style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: '#2c3e50',
                            marginBottom: '12px',
                            letterSpacing: '-0.3px'
                        }}>
                            {plant.name}
                        </div>

                        <div style={{
                            display: 'inline-block',
                            padding: '8px 20px',
                            borderRadius: '20px',
                            background: colors.bg,
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '15px',
                            boxShadow: `0 4px 12px ${colors.glow}`,
                            letterSpacing: '0.5px'
                        }}>
                            {rarityNames[plant.rarity] || '일반'}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bg}cc 100%)`,
                            color: 'white',
                            border: 'none',
                            padding: '14px 40px',
                            borderRadius: '30px',
                            fontSize: '17px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: `0 6px 20px ${colors.glow}`,
                            transition: 'all 0.3s',
                            width: '100%',
                            marginTop: '10px'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = `0 8px 25px ${colors.glow}`;
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = `0 6px 20px ${colors.glow}`;
                        }}
                    >
                        도감에 등록하기
                    </button>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleUp {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
        </div>
    );
}
