// src/components/ErrorBoundary.jsx
import React, { useState } from 'react';

function withErrorBoundary(Component) {
  return function ErrorBoundaryWrapper(props) {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);

    React.useEffect(() => {
      // Add error event listener
      const errorHandler = (event) => {
        event.preventDefault();
        setHasError(true);
        setError(event.error);
        console.error('Error caught by boundary:', event.error);
      };

      window.addEventListener('error', errorHandler);
      window.addEventListener('unhandledrejection', errorHandler);

      return () => {
        window.removeEventListener('error', errorHandler);
        window.removeEventListener('unhandledrejection', errorHandler);
      };
    }, []);

    if (hasError) {
      return (
        <div className="p-4">
          <h1 className="text-xl font-bold text-red-600">
            Something went wrong
          </h1>
          <pre className="mt-2 p-2 bg-gray-100 rounded">
            {error?.toString()}
          </pre>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

function ErrorBoundary({ children }) {
  const BoundaryComponent = withErrorBoundary(() => <>{children}</>);
  return <BoundaryComponent />;
}

export default ErrorBoundary;
