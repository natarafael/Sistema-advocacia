import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { notify } from '../utils/toast';
import { DocumentIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { convertDocxToHtml } from '../utils/documentConverter';
import { detectPlaceholders } from '../utils/templateProcessor';

export default function TemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: '',
    description: '',
    file: null,
  });

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
      notify.error('Erro ao carregar template');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && !file.name.endsWith('.docx')) {
      notify.error('Por favor adicione um documento .docx (Microsoft Word)');
      return;
    }
    setUploadData({ ...uploadData, file });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.name) {
      notify.error('Por favor preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Sanitize filename: remove special characters and spaces
      const sanitizedName = uploadData.file.name
        .replace(/[^a-zA-Z0-9.]/g, '_') // Replace special chars with underscore
        .toLowerCase(); // Convert to lowercase

      const fileName = `template_${Date.now()}_${sanitizedName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('templates')
        .upload(fileName, uploadData.file);

      if (uploadError) throw uploadError;

      // Create template record
      const { data, error } = await supabase
        .from('templates')
        .insert([
          {
            name: uploadData.name,
            description: uploadData.description,
            file_path: fileName,
            created_by: (await supabase.auth.getUser()).data.user.id,
          },
        ])
        .select();

      if (error) throw error;

      notify.success('Template Adicionada com sucesso!');
      setTemplates([data[0], ...templates]);
      setUploadData({ name: '', description: '', file: null });
      setShowForm(false);
    } catch (error) {
      notify.error('Erro ao adicionar template');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Você tem certeza que deseja deletar essa template?')) return;

    try {
      const { error } = await supabase.from('templates').delete().eq('id', id);

      if (error) throw error;

      setTemplates(templates.filter((template) => template.id !== id));
      notify.success('Template deletada com sucesso!');
    } catch (error) {
      notify.error('Erro ao deletar template');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Templates</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 text-lg font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Template
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome da Template*
              </label>
              <input
                type="text"
                value={uploadData.name}
                onChange={(e) =>
                  setUploadData({ ...uploadData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                value={uploadData.description}
                onChange={(e) =>
                  setUploadData({ ...uploadData, description: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Arquivo Template (.docx)*
              </label>
              <input
                type="file"
                accept=".docx"
                onChange={handleFileSelect}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-lg font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="grid gap-4">
          {templates.length > 0 ? (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <DocumentIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-l text-gray-500">
                        {template.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      Adicionado{' '}
                      {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              Nenhuma template adicionada
            </div>
          )}
        </div>
      )}
    </div>
  );
}
