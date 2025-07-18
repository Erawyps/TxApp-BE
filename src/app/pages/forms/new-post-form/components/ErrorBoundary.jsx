import React, { useState } from 'react';
import { Button, Card } from 'components/ui';

export function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      {hasError ? (
        <Card className="p-6 m-4 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Une erreur est survenue
          </h2>
          <p className="mb-6">Veuillez recharger l&apos;application</p>
          <Button onClick={handleReload}>
            Recharger
          </Button>
        </Card>
      ) : (
        <ErrorBoundaryInner onError={() => setHasError(true)}>
          {children}
        </ErrorBoundaryInner>
      )}
    </>
  );
}

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}