"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] caught error:", error.message);
    console.error("[ErrorBoundary] stack:", errorInfo.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50/30 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-gray-100">
              <div className="mx-auto h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-7 w-7 text-amber-600" />
              </div>
              <h2 className="font-heading text-lg font-bold text-gray-900 mb-2">
                Terjadi Kesalahan
              </h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Halaman ini mengalami error. Ini mungkin disebabkan oleh konfigurasi
                database yang belum selesai. Silakan coba muat ulang atau kembali ke beranda.
              </p>
              {this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Detail error
                  </summary>
                  <pre className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded-lg overflow-x-auto max-h-32">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Muat Ulang
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 rounded-full"
                  size="sm"
                >
                  Ke Beranda
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
