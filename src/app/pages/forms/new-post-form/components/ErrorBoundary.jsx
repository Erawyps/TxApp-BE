import React from 'react';
import { Card, Button } from 'components/ui';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 m-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Oops! Une erreur s&apos;est produite
            </h2>
            <p className="text-gray-600 mb-4">
              Quelque chose s&apos;est mal passé. Veuillez réessayer.
            </p>
            
            {typeof window === 'undefined' && typeof globalThis.process !== 'undefined' && globalThis.process.env?.NODE_ENV === 'development' && (
              <details className="text-left bg-gray-100 p-4 rounded mb-4">
                <summary className="cursor-pointer font-medium">
                  Détails de l&apos;erreur (dev only)
                </summary>
                <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                  {this.state.error && this.state.error.toString()}
                </pre>
                <pre className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <Button 
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              color="primary"
            >
              Réessayer
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;