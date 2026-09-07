import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center text-slate-100">
          <div className="p-4 bg-rose-950/60 text-rose-400 border border-rose-800/60 rounded-2xl mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            An unexpected error occurred while rendering this view. Please refresh or try again.
          </p>
          <Button onClick={this.handleReset} variant="primary" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reload Workspace
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
