import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Chatty Crash Catch]', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center p-8 bg-rose-50/80 text-zinc-800 select-none">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white shadow-xl border border-rose-200 flex flex-col items-center text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-bold mb-1">Something unexpected happened</h2>
            <p className="text-xs text-zinc-500 mb-4">
              Chatty caught a runtime error. Don't worry, your sessions and data are safe on your Mac.
            </p>

            <pre className="w-full p-3 rounded-xl bg-zinc-100 text-[11px] font-mono text-left text-rose-700 overflow-x-auto mb-6 max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </pre>

            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reload Chatty</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
