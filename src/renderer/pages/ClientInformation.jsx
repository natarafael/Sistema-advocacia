import { PaperClipIcon, DocumentIcon } from '@heroicons/react/20/solid';
import CustomSeparator from '../components/BreadCrumbs';
import Payments from '../components/Payments';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { FileList } from '../components/FileList';
import ClientAppointments from '../components/ClientAppointments';
import {
  DocumentPlusIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import DocumentGenerationModal from '../components/DocumentGenerationModal';

export default function ClientInformation() {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  const navigate = useNavigate();

  const fetchClientData = async (clientId) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client data:', error);
      return null;
    }
  };

  const handleUploadComplete = () => {
    alert('Documento adicionado com sucesso');
    setRefreshTrigger((prev) => prev + 1);
    setError(null);
  };

  const handleUploadError = (error) => {
    setError(error.message);
  };

  useEffect(() => {
    const getClientData = async () => {
      setIsLoading(true);
      const cachedData = localStorage.getItem(`client_${id}`);

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const isRecent = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutes

        if (isRecent) {
          setClientData(data);
          setIsLoading(false);
          return;
        }
      }

      const fetchedData = await fetchClientData(id);
      if (fetchedData) {
        setClientData(fetchedData);
        localStorage.setItem(
          `client_${id}`,
          JSON.stringify({
            data: fetchedData,
            timestamp: Date.now(),
          }),
        );
      }
      setIsLoading(false);
    };

    getClientData();
  }, [id]);

  const handleEditButton = () => {
    console.log(clientData);
    navigate(`/clientRegistration/${clientData.id}`);
  };

  return (
    <>
      <CustomSeparator title={'Cliente'} />
      <div className="p-6">
        <div>
          <div className="flex justify-between items-end px-4 sm:px-0">
            <div>
              <h3 className="text-xl font-semibold leading-7 text-gray-900">
                Informações do Cliente
              </h3>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDocumentModal(true)}
                className="rounded-md bg-primary px-5 py-3 text-l font-bold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light flex items-center"
              >
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                Gerar Documento
              </button>
              <button
                variant="primary"
                onClick={handleEditButton}
                className="rounded-md bg-primary px-5 py-3 text-l font-bold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light flex items-center"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Editar Informações
              </button>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              {/* Nome Completo e CPF */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Nome Completo
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.first_name + ' ' + clientData?.last_name}
                </dd>
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  CPF
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.cpf}
                </dd>
              </div>

              {/* RG e Telefone */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  RG
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.rg}
                </dd>
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Telefone
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.phone}
                </dd>
              </div>

              {/* Telefone para contato e Data de Nascimento */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Telefone para Contato
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.contact_phone}
                </dd>
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Data de Nascimento
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.birth_date}
                </dd>
              </div>

              {/* Email e Nome da Mãe */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Email
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.email}
                </dd>
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Nome da Mãe
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.mother_name}
                </dd>
              </div>

              {/* Nome do Pai e CEP */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Nome do Pai
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.father_name}
                </dd>
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  CEP
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.cep}
                </dd>
              </div>

              {/* Endereço e Cidade */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Endereço
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.address + ' N. ' + clientData?.address_number}
                </dd>
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Cidade
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.city}
                </dd>
              </div>

              {/* Estado e outros detalhes */}
              <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Estado
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  {clientData?.state}
                </dd>
              </div>

              {/* Pagamentos */}
              <div className="px-4 py-6 sm:grid sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Pagamentos
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  <div>
                    <Payments></Payments>
                  </div>
                </dd>
              </div>

              {/* Appointments */}
              <div className="px-4 py-6 sm:grid sm:gap-4 sm:px-0">
                <dt className="text-lg font-semibold leading-6 text-gray-900">
                  Notas de Atendimentos
                </dt>
                <dd className="mt-1 text-lg leading-6 text-gray-700 sm:col-span-1 sm:mt-0">
                  <ClientAppointments clientId={id} />
                </dd>
              </div>

              {/* Anexos */}
              <div className="px-4 py-6 sm:grid sm:gap-4 sm:px-0">
                <div className="flex items-center justify-start">
                  <dt className="text-lg font-semibold leading-6 text-gray-900">
                    Documentos
                  </dt>
                </div>
                <dd className="mt-2 text-lg text-gray-900 sm:col-span-2 sm:mt-0">
                  <div className="border rounded-lg border-gray-200 p-4">
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                        {error}
                      </div>
                    )}

                    <div className="space-y-4">
                      <FileUpload
                        clientId={id}
                        onUploadComplete={handleUploadComplete}
                        onError={handleUploadError}
                      />

                      <div className="mt-4">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Documentos do Cliente
                        </h4>
                        <FileList
                          clientId={id}
                          refreshTrigger={refreshTrigger}
                          onFileDelete={() =>
                            setRefreshTrigger((prev) => prev + 1)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Document Generation Modal */}
      {showDocumentModal && (
        <DocumentGenerationModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          clientId={id}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </>
  );
}
