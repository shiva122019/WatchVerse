import React from "react";
import { AlertOctagon, RefreshCcw } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6 text-white">
          <div className="relative flex max-w-md flex-col items-center text-center">
            {/* Glow effect behind icon */}
            <div className="absolute top-10 h-32 w-32 rounded-full bg-[#FF0055]/20 blur-[60px]" />
            
            <div className="relative mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
              <AlertOctagon className="h-16 w-16 text-[#FF0055]" />
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight text-white">
              Something went wrong
            </h1>
            
            <p className="mt-4 text-neutral-400">
              We encountered an unexpected error while loading this page. This might be due to a temporary network issue or an external service failing.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="mt-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#00c3ff] px-8 py-3.5 font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
            >
              <RefreshCcw className="h-5 w-5" />
              Reload Page
            </button>
            
            {/* Developer Error Output (Only visible if the error message exists) */}
            {this.state.error && (
              <div className="mt-12 w-full rounded-xl border border-white/5 bg-black/40 p-4 text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#FF0055]">Error Details</p>
                <code className="text-xs text-neutral-500 break-words font-mono">
                  {this.state.error.toString()}
                </code>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
