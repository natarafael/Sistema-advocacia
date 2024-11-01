import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'text-sm',
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
        },
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
