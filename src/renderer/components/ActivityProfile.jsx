import { useState, useEffect } from 'react';
import { useAuth } from '../services/Auth';

export default function ActivityLogSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { fetchActivityLogs } = useAuth();

  const toggleSection = async () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && logs.length === 0) {
      // Only fetch if we're expanding and haven't loaded logs yet
      setLoading(true);
      try {
        const data = await fetchActivityLogs();
        setLogs(data);
      } catch (error) {
        console.error('Error loading activity logs:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="mt-8">
      <button
        onClick={toggleSection}
        className="flex items-center justify-start w-full text-left"
      >
        <h3 className="text-xl font-medium leading-6 text-gray-900">
          Histórico de Atividades
        </h3>
        <span className="ml-2 mt-1">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className="mt-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ação
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Data
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {log.action_type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
