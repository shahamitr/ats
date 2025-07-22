import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="max-w-lg mx-auto mt-10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong.</AlertTitle>
          <AlertDescription>We're sorry for the inconvenience. Please try refreshing the page.</AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;