import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { notify } from '../utils/toast';
import { useAuth } from '../services/Auth';
import { documentService } from '../services/documentService';

export default function DocumentGenerationModal({ isOpen, onClose, clientId }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data);
    } catch (error) {
      notify.error('Error fetching templates');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      notify.error('Please select a template');
      return;
    }

    setLoading(true);
    try {
      await documentService.generateDocument(
        selectedTemplate,
        clientId,
        user.id,
      );
      notify.success('Document generated successfully');
      onClose();
    } catch (error) {
      console.error('Error generating document:', error);
      notify.error(error.message || 'Error generating document');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Gerar Documento</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o Modelo
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">Selecione um modelo...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-md"
              disabled={loading || !selectedTemplate}
            >
              {loading ? 'Gerando...' : 'Gerar Documento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
