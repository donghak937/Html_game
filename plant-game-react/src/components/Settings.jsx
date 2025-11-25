import React, { useState } from 'react';

export function Settings({ resetGame, activateGodMode }) {
    const [command, setCommand] = useState('');

    const handleCommandSubmit = (e) => {
        e.preventDefault();

        if (command === 'clear') {
            resetGame();
            setCommand('');
        } else if (command === 'God_Mod') {
            activateGodMode();
            setCommand('');
        } else {
            alert('Unknown Command');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#2d3436', marginBottom: '20px' }}>⚙️ 설정</h2>

            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
                <h3 style={{ marginTop: 0, color: '#636e72' }}>Developer Console</h3>
                <form onSubmit={handleCommandSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        placeholder="Enter command..."
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #dfe6e9',
                            fontSize: '1em'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '10px 20px',
                            background: '#2d3436',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Run
                    </button>
                </form>
                <p style={{ fontSize: '0.8em', color: '#b2bec3', marginTop: '10px' }}>
                    * Hidden commands available
                </p>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center', color: '#b2bec3', fontSize: '0.9em' }}>
                Plant Tycoon v1.6.0
                <br />
                Created with Antigravity
            </div>
        </div>
    );
}
