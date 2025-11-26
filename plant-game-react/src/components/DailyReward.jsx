import React, { useEffect, useState } from 'react';

export function DailyReward({ dailyReward, onClaim, onClose }) {
    const [claimedToday, setClaimedToday] = useState(false);

    useEffect(() => {
        if (dailyReward.lastClaimed) {
            const lastDate = new Date(dailyReward.lastClaimed);
            const now = new Date();
            const isSameDay = lastDate.getFullYear() === now.getFullYear() &&
                lastDate.getMonth() === now.getMonth() &&
                lastDate.getDate() === now.getDate();
            setClaimedToday(isSameDay);
        }
    }, [dailyReward]);

    const rewards = [
        { day: 1, label: "500 G", icon: "💰" },
        { day: 2, label: "1000 G", icon: "💰" },
        { day: 3, label: "성장 물약 x1", icon: "🧪" },
        { day: 4, label: "2000 G", icon: "💰" },
        { day: 5, label: "씨앗 폭탄 x1", icon: "💣" },
        { day: 6, label: "성장 물약 x2", icon: "🧪" },
        { day: 7, label: "5000 G + 폭탄 x3", icon: "🎁" },
    ];

    const handleClaim = () => {
        const result = onClaim();
        if (result.success) {
            setClaimedToday(true);
            // alert(`출석 보상 획득! \n${JSON.stringify(result.reward)}`); // Simple alert for now
        }
    };

    // Calculate current streak display
    // If claimed today, streak is current. If not, streak is current (waiting to claim next).
    // We want to highlight the *next* reward to claim.
    // If streak is 0, next is 1.
    // If streak is 1 and claimed today, next is 2 (tomorrow).
    // If streak is 1 and NOT claimed today, next is 2? No, next is 2 if we just claimed 1?
    // Wait, if I have streak 1 (claimed yesterday), today I claim 2.
    // So current streak in state is "last claimed streak".

    const nextStreak = claimedToday ? (dailyReward.streak % 7) + 1 : (dailyReward.streak % 7) + 1;
    // Actually, let's just highlight based on (dailyReward.streak)
    // If claimed today, we show checkmark on current streak.
    // If not claimed today, we show "Claimable" on (streak + 1).

    const currentStreakIndex = dailyReward.streak; // 1-based

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
        }}>
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '20px',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{ color: '#6c5ce7', marginBottom: '5px' }}>📅 출석 체크</h2>
                <p style={{ color: '#636e72', marginBottom: '20px' }}>매일 접속하고 보상을 받으세요!</p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                    marginBottom: '20px'
                }}>
                    {rewards.map((r) => {
                        // Determine status
                        // If r.day <= currentStreakIndex: Claimed (if claimed today or past)
                        // Wait, if I claimed day 1 yesterday. Streak is 1.
                        // Today I open. Streak is 1. Not claimed today.
                        // I should see Day 1 as checked? Or Day 1 as done, Day 2 as target?

                        // Logic:
                        // If claimedToday:
                        //   Days <= streak are DONE.
                        //   Days > streak are LOCKED.
                        // If NOT claimedToday:
                        //   Days <= streak are DONE.
                        //   Day == streak + 1 is TARGET.

                        let status = 'locked';
                        if (claimedToday) {
                            if (r.day <= currentStreakIndex) status = 'done';
                        } else {
                            if (r.day <= currentStreakIndex) status = 'done';
                            if (r.day === currentStreakIndex + 1) status = 'target';
                            // Handle reset case? If streak broken, we restart at 1.
                            // But UI doesn't know it's broken until we claim.
                            // So just show next step.
                        }

                        // Special case: Day 7 spans full width?
                        const isBig = r.day === 7;

                        return (
                            <div key={r.day} style={{
                                gridColumn: isBig ? 'span 4' : 'span 1',
                                background: status === 'done' ? '#dfe6e9' : status === 'target' ? '#ffeaa7' : '#f1f2f6',
                                border: status === 'target' ? '2px solid #fdcb6e' : '1px solid #dfe6e9',
                                borderRadius: '10px',
                                padding: '10px',
                                opacity: status === 'done' ? 0.6 : 1,
                                position: 'relative'
                            }}>
                                <div style={{ fontSize: '0.8em', color: '#b2bec3', marginBottom: '5px' }}>Day {r.day}</div>
                                <div style={{ fontSize: '1.5em', marginBottom: '5px' }}>{r.icon}</div>
                                <div style={{ fontSize: '0.7em', fontWeight: 'bold', color: '#2d3436' }}>{r.label}</div>
                                {status === 'done' && <div style={{ position: 'absolute', top: 5, right: 5 }}>✅</div>}
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={handleClaim}
                    disabled={claimedToday}
                    className="btn"
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: claimedToday ? '#b2bec3' : '#00b894',
                        fontSize: '1.1em',
                        marginBottom: '10px'
                    }}
                >
                    {claimedToday ? '내일 또 오세요!' : '보상 받기'}
                </button>

                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#636e72',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    닫기
                </button>
            </div>
        </div>
    );
}
