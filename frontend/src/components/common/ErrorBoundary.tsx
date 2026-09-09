import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-6 text-rose-200 flex flex-col gap-4 my-4 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <h3 className="font-semibold text-base text-rose-100">
              {this.props.fallbackTitle || 'Component Rendering Error'}
            </h3>
          </div>
          <p className="text-xs font-mono bg-slate-950/80 p-3 rounded border border-rose-900/50 text-rose-300 break-words whitespace-pre-wrap">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <div>
            <button
              onClick={this.handleReset}
              className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Component</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
