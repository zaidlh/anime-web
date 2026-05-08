import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public props!: Props;
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="w-full min-h-screen bg-[#101010] flex flex-col items-center justify-center p-8 text-white">
          <div className="bg-[#1E1E1E] border border-red-500/30 rounded-xl p-8 max-w-3xl w-full shadow-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              Application Error
            </h1>
            
            <div className="mb-6">
              <h2 className="text-sm font-bold text-[#8E8E8E] uppercase tracking-wider mb-2">Message</h2>
              <p className="font-mono text-sm bg-black/50 p-4 rounded text-red-300 break-words">
                {this.state.error?.toString()}
              </p>
            </div>

            {this.state.errorInfo && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-[#8E8E8E] uppercase tracking-wider mb-2">Component Stack</h2>
                <pre className="font-mono text-xs bg-black/50 p-4 rounded text-[#d4d4d4] overflow-auto max-h-64 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
