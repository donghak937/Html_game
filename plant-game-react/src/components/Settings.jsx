import React from 'react';

export function Settings({ resetGame, activateGodMode, user, onLogin, onLogout, onSave, onLoad, isSaving, lastSaved }) {
    return (
        <div className="settings-container" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
            <h2 style={{ color: '#2d3436', marginBottom: '20px' }}>설정</h2>

            {/* Cloud Save Section */}
            <div style={{ marginBottom: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#6c5ce7' }}>☁️ 클라우드 저장</h3>

                {!user ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: '#636e72', marginBottom: '15px' }}>
                            구글 로그인하여 데이터를 안전하게 보관하세요.
                        </p>
                        <button
                            onClick={onLogin}
                            className="btn"
                            style={{ width: '100%', background: '#4285F4' }}
                        >
                            Google 계정으로 로그인
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '15px',
                            padding: '10px',
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #dfe6e9'
                        }}>
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                            />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>{user.displayName}</div>
                                <div style={{ fontSize: '0.8em', color: '#636e72', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
                            </div>
                            <button
                                onClick={onLogout}
                                style={{
                                    padding: '5px 10px',
                                    fontSize: '0.8em',
                                    background: '#ff7675',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                로그아웃
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className="btn"
                                style={{ fontSize: '0.9em', padding: '10px' }}
                            >
                                {isSaving ? '저장 중...' : '☁️ 클라우드 저장'}
                            </button>
                            <button
                                onClick={onLoad}
                                disabled={isSaving}
                                className="btn-secondary"
                                style={{ fontSize: '0.9em', padding: '10px' }}
                            >
                                📥 불러오기
                            </button>
                        </div>
                        {lastSaved && (
                            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.8em', color: '#00b894' }}>
                                ✅ 마지막 저장: {lastSaved.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Game Reset Section */}
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#d63031' }}>⚠️ 위험 구역</h3>
                <p style={{ fontSize: '0.9em', color: '#636e72', marginBottom: '10px' }}>
                    모든 게임 데이터를 삭제하고 처음부터 시작합니다. (복구 불가)
                </p>
                <button
                    onClick={() => {
                        if (window.confirm('정말로 초기화하시겠습니까? 모든 데이터가 사라집니다!')) {
                            resetGame();
                        }
                    }}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#d63031',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    🗑️ 데이터 초기화
                </button>
            </div>

            {/* God Mode (Hidden) */}
            <div
                style={{ height: '50px', marginTop: '30px' }}
                onClick={(e) => {
                    if (e.detail === 5) {
                        activateGodMode();
                    }
                }}
            />

            <div style={{ textAlign: 'center', fontSize: '0.8em', color: '#b2bec3' }}>
                v1.9.1 (Cloud Enabled)
            </div>
        </div>
    );
}
