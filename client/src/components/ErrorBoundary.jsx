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
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        window.location.href = '/';
    };

    handleLogout = () => {
        localStorage.clear(); // Clear everything to be safe
        window.location.href = '/login';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
                    <div className="bg-red-50 p-10 rounded-3xl border-2 border-red-100 max-w-lg shadow-xl">
                        <div className="text-red-500 text-6xl mb-6">Oops!</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
                        <p className="text-gray-600 mb-8">
                            A rendering error occurred. This could be due to a bug or a connection issue.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={this.handleReset}
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={20} /> Try Refreshing
                            </button>

                            <button
                                onClick={this.handleLogout}
                                className="text-gray-500 font-semibold hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} /> Forced Logout (Back to Login)
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
