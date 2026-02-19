import React from 'react';
import { LogOut, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Admin Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        window.location.href = '/';
    };

    handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] p-4 text-center">
                    <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-lg shadow-2xl">
                        <div className="text-blue-400 text-6xl mb-6">Admin Error</div>
                        <h2 className="text-2xl font-bold text-white mb-4">Dashboard encountered an issue</h2>
                        <p className="text-gray-400 mb-8">
                            A rendering error occurred in the Admin Portal. This might be due to a bug or data inconsistency.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={this.handleReset}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={20} /> Reload Dashboard
                            </button>

                            <button
                                onClick={this.handleLogout}
                                className="text-gray-400 font-semibold hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} /> Back to Admin Login
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
