import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  compact?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[CONON-NOW Surface ErrorBoundary caught]:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className={`${
            this.props.compact ? "my-3 p-4" : "min-h-[240px] p-6"
          } w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200`}
        >
          <div className="max-w-md w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              {this.props.fallbackTitle || "Section temporarily recovering"}
            </h3>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-rose-600 mt-1 break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-3 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Section</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
