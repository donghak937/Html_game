import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Game Crash:", error, errorInfo);
    }

    handleReset = () => {
        if (window.confirm('게임 데이터를 초기화하고 복구하시겠습니까?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: '#ffeaa7',
                    color: '#2d3436',
                    textAlign: 'center',
                    padding: '20px'
                }}>
                    <div style={{ fontSize: '5em', marginBottom: '20px' }}>😵</div>
                    <h1>앗! 게임에 문제가 생겼어요.</h1>
                    <p style={{ marginBottom: '30px', color: '#636e72' }}>
                        저장된 데이터에 오류가 있을 수 있습니다.<br />
                        아래 버튼을 눌러 초기화하면 해결될 수 있습니다.
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '15px 30px',
                            fontSize: '1.2em',
                            background: '#d63031',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 0 #c0392b'
                        }}
                    >
                        🔄 데이터 초기화 및 복구
                    </button>
                    <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#b2bec3' }}>
                        Error: {this.state.error?.toString()}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
