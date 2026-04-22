import React, { Component, ErrorInfo } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl shadow-xl p-10 border-t-4 border-t-[#E83E2D] border border-[#E5E7EB] max-w-lg w-full text-center">
            <div className="h-1 w-12 bg-[#E83E2D] rounded-full mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#1A1F5E] mb-3">Something went wrong</h1>
            <p className="text-[#8C8C8C] leading-relaxed mb-2">
              An unexpected error occurred. Our team has been notified.
            </p>
            {this.state.error && (
              <p className="text-xs text-[#8C8C8C] font-mono bg-[#F4F4F4] rounded-xl px-4 py-2 mb-6 break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 shadow-lg"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
