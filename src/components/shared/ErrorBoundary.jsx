import { Component } from 'react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends Component {
  state = { 
    hasError: false,
    error: null 
  };

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      error 
    };
  }

  componentDidCatch(error, errorInfo) {
    console.group("ErrorBoundary");
    console.error("Erreur:", error);
    console.error("Info:", errorInfo);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">
            {this.props.title || "Erreur de rendu"}
          </h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.toString()}
          </p>
          {this.props.fallback || (
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm"
            >
              Recharger
            </button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  fallback: PropTypes.node,
  title: PropTypes.string,
};