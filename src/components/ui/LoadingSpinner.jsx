export default function LoadingSpinner({ className = '' }) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }