import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          </div>

          <div className="max-w-md w-full card p-8 text-center relative z-10 animate-scaleIn">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-2xl shadow-glow animate-pulse">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-100 mb-3">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-dark-800/80 border border-dark-600 rounded-xl text-left">
                <h3 className="font-semibold text-gray-200 mb-2">Error Details:</h3>
                <pre className="text-xs text-gray-400 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleReset}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Go Home</span>
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
