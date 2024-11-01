import React, { useState, useEffect } from 'react';
import { sessionManager } from '../services/SessionManager';

export function SessionStatus() {
  const [sessionStatus, setSessionStatus] = useState(
    sessionManager.getSessionStatus(),
  );

  useEffect(() => {
    // Update every minute instead of every second
    const interval = setInterval(() => {
      setSessionStatus(sessionManager.getSessionStatus());
    }, 60000); // (1 minute)

    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="text-sm text-gray-500">
      <span
        className={`inline-block w-2 h-2 rounded-full mr-2 ${
          sessionStatus.isActive ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      Session expires in: {formatTimeRemaining(sessionStatus.timeRemaining)}
    </div>
  );
}
