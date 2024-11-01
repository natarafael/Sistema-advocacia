import { useState, useEffect } from 'react';
import { sessionManager } from '../services/SessionManager';

export default function StatusIndicator() {
  const [sessionStatus, setSessionStatus] = useState(
    sessionManager.getSessionStatus(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionStatus(sessionManager.getSessionStatus());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
        sessionStatus.isActive ? 'bg-green-400' : 'bg-red-400'
      }`}
      title={`Sessão ${sessionStatus.isActive ? 'Ativa' : 'Inativa'}`}
    />
  );
}
