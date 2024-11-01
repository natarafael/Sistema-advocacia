import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { notify } from '../utils/toast';
import { DocumentIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { convertDocxToHtml } from '../utils/documentConverter';
import { detectPlaceholders } from '../utils/templateProcessor';

const TEMPLATE_FIELDS = {
  CLIENT: [
    'nomeCliente',
    'nacionalidade',
    'estadoCivil',
    'numeroRG',
    'expeditorRG',
    'numeroCPF',
    'endereçoCompleto',
  ],
  LAWYER: ['nomeAdv', 'numeroOAB'],
  DOCUMENT: ['dataContrato'],
};

const FIELD_MAPPINGS = {
  // Client fields mapping
  nomeCliente: (client) => `${client.first_name} ${client.last_name}`,
  nacionalidade: (client) => client.nationality,
  estadoCivil: (client) => client.marital_status,
  numeroRG: (client) => client.rg,
  expeditorRG: (client) => client.expeditor_rg,
  numeroCPF: (client) => client.cpf,
  enderecoCompleto: (client) =>
    `${client.address}, nº ${client.address_number}, ${client.neighborhood}, ${client.city}/${client.state}`,

  // Lawyer fields mapping
  nomeAdv: (profile) => profile.name,
  numeroOAB: (profile) => profile.oab_number,

  // Document fields
  dataContrato: () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('pt-BR', options);
  },
};

export default function TemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [detectedFields, setDetectedFields] = useState(null);
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
      notify.error('Error fetching templates');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && !file.name.endsWith('.docx')) {
      notify.error('Please upload a .docx file');
      return;
    }
    setUploadData({ ...uploadData, file });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.name) {
      notify.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Convert DOCX to HTML
      const htmlContent = await convertDocxToHtml(uploadData.file);

      // Detect and validate placeholders
      const { validPlaceholders, invalidPlaceholders } =
        detectPlaceholders(htmlContent);

      // If there are invalid placeholders, show error
      if (invalidPlaceholders.length > 0) {
        notify.error(
          <div>
            Invalid placeholders found:
            <ul className="mt-2 list-disc list-inside">
              {invalidPlaceholders.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>,
        );
        return;
      }

      // Save template and its fields
      const { data: template, error: templateError } = await supabase
        .from('templates')
        .insert([
          {
            name: uploadData.name,
            description: uploadData.description,
            html_content: htmlContent,
            created_by: (await supabase.auth.getUser()).data.user.id,
          },
        ])
        .select()
        .single();

      if (templateError) throw templateError;

      // Save template fields
      if (validPlaceholders.length > 0) {
        const fieldEntries = validPlaceholders.map((field) => ({
          template_id: template.id,
          field_key: field,
          field_name: field, // You might want to add a prettier name mapping
          field_description: `Field for ${field}`,
        }));

        const { error: fieldsError } = await supabase
          .from('template_fields')
          .insert(fieldEntries);

        if (fieldsError) throw fieldsError;
      }

      notify.success('Template uploaded successfully');
      setTemplates([template, ...templates]);
      setUploadData({ name: '', description: '', file: null });
      setShowUploadForm(false);
    } catch (error) {
      notify.error('Error uploading template');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase.from('templates').delete().eq('id', id);

      if (error) throw error;

      setTemplates(templates.filter((template) => template.id !== id));
      notify.success('Template deleted successfully');
    } catch (error) {
      notify.error('Error deleting template');
      console.error('Error:', error);
    }
  };

  const handlePreview = async () => {
    if (!uploadData.file) {
      notify.error('Please select a file first');
      return;
    }

    try {
      const htmlContent = await convertDocxToHtml(uploadData.file);
      setPreviewHtml(htmlContent);

      const { validPlaceholders, invalidPlaceholders } =
        detectPlaceholders(htmlContent);
      setDetectedFields({
        valid: validPlaceholders,
        invalid: invalidPlaceholders,
      });
    } catch (error) {
      notify.error('Error previewing document');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Templates</h2>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Template
        </button>
      </div>

      {showUploadForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Template Name*
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
                Description
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
                Template File (.docx)*
              </label>
              <input
                type="file"
                accept=".docx"
                onChange={handleFileSelect}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                required
              />
            </div>

            {uploadData.file && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark"
                >
                  Preview Conversion
                </button>
              </div>
            )}

            {previewHtml && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </h3>
                <div
                  className="p-4 border rounded-md bg-white overflow-auto max-h-96"
                  style={{
                    margin: '20px auto',
                    maxWidth: '800px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}

            {detectedFields && (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Detected Fields:
                  </h4>
                  <div className="mt-2">
                    {detectedFields.valid.map((field) => (
                      <span
                        key={field}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-2"
                      >
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
                {detectedFields.invalid.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-600">
                      Invalid Fields:
                    </h4>
                    <div className="mt-2">
                      {detectedFields.invalid.map((field) => (
                        <span
                          key={field}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2 mb-2"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark"
              >
                Upload
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
                    <h3 className="text-sm font-medium text-gray-900">
                      {template.name}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-gray-500">
                        {template.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      Added {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
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
