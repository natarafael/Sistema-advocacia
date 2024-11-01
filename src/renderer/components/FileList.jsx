import React, { useState, useEffect } from 'react';
import { fileService } from '../services/fileService';
import { DocumentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { notify } from '../utils/toast';

export function FileList({ clientId, onFileDelete, refreshTrigger }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        const data = await fileService.getClientFiles(clientId);
        setFiles(data);
      } catch (error) {
        console.error('Error loading files:', error);
        notify.error('Erro ao carregar arquivos');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [clientId, refreshTrigger]);

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await notify.promise(fileService.deleteFile(fileId), {
        loading: 'Deletando arquivo...',
        success: 'Arquivo deletado com sucesso!',
        error: 'Erro ao deletar arquivo',
      });

      // Update the local state by filtering out the deleted file
      setFiles((currentFiles) => currentFiles.filter((f) => f.id !== fileId));

      if (onFileDelete) onFileDelete();
    } catch (error) {
      console.error('Error deleting file:', error);

      alert('Error deleting file. Please try again.');
    }
  };

  const handleDownload = async (file) => {
    try {
      notify.loading('Preparando download...');
      const signedUrl = await fileService.getFileUrl(file.file_path);
      // Open in new tab or trigger download
      window.open(signedUrl, '_blank');
      notify.dismiss();
    } catch (error) {
      console.error('Error downloading file:', error);
      notify.error('Erro ao baixar arquivo');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-4">
      <div className="space-y-4">
        {files?.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border"
          >
            <div className="flex items-center space-x-4">
              <DocumentIcon className="h-6 w-6 text-gray-400" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {file.file_name}
                </h4>
                <p className="text-sm text-gray-500">
                  {new Date(file.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleDownload(file)}
                className="text-primary hover:text-primary-dark"
              >
                Download
              </button>
              <button
                onClick={() => handleDelete(file.id)}
                className="text-red-600 hover:text-red-900"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <p className="text-gray-500 text-center">
            Nenhum Documento Carregado
          </p>
        )}
      </div>
    </div>
  );
}
