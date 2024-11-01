import { useState, useEffect } from 'react';
import CustomSeparator from '../components/BreadCrumbs';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useHookFormMask } from 'use-mask-input';
import { cpfIsValid } from 'cpf_and_cnpj-validator';
import ky from 'ky';
import { supabase } from '../services/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { notify } from '../utils/toast';

function validateCPF(value) {
  return cpfIsValid(value);
}

const RegistrationSchema = yup.object().shape({
  firstName: yup.string().required('Nome é um campo obrigatório.'),
  lastName: yup.string().required('Sobrenome é um campo obrigatório.'),
  phone: yup
    .string()
    .transform((value) => value.replace(/[^\d]/g, ''))
    .required('Telefone é obrigatório'),
  contactPhone: yup.string().transform((value) => value.replace(/[^\d]/g, '')),
  cpf: yup
    .string()
    .transform((value) => value.replace(/[^\d]/g, ''))
    .test('is-valid-cpf', 'CPF inválido', (value) => validateCPF(value))
    .required('CPF é um campo obrigatório.'),
  rg: yup
    .string()
    // .transform((value) => value.replace(/[^\d]/g, ''))
    .required('RG é um campo obrigatório.'),
  cep: yup
    .string()
    .transform((value) => value.replace(/[^\d]/g, ''))
    .required('CEP é um campo obrigatório.'),
  address: yup.string().required('Endereço é um campo obrigatório.'),
  addressNumber: yup.string(),
  city: yup.string().required('Cidade é um campo obrigatório.'),
  state: yup.string().required('Estado é um campo obrigatório.'),
  fatherName: yup.string(),
  motherName: yup.string().required('Nome da mãe é um campo obrigatório.'),
  birthDate: yup.date().required('Data de nascimento é um campo obrigatório.'),
});

export default function ClientForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegistrationSchema),
    defaultValues: clientData || {}, // Set default values from clientData
  });

  const { id } = useParams();

  useEffect(() => {
    async function fetchClientData() {
      if (id) {
        setIsSubmitting(true);
        try {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            // Transform the data to match your form field names
            const formattedData = {
              firstName: data.first_name,
              lastName: data.last_name,
              phone: data.phone,
              contactPhone: data.contact_phone,
              cpf: data.cpf,
              rg: data.rg,
              cep: data.cep,
              address: data.address,
              addressNumber: data.address_number,
              city: data.city,
              state: data.state,
              fatherName: data.father_name,
              motherName: data.mother_name,
              birthDate: data.birth_date,
            };
            setClientData(formattedData);
            reset(formattedData); // This will update the form with the new values
          }
        } catch (error) {
          console.error('Error fetching client data:', error);
          alert('Error fetching client data. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      }
    }

    fetchClientData();
  }, [id, reset]);

  const registerWithMask = useHookFormMask(register);

  const handleSupabaseError = (error) => {
    if (error.code === '23505') {
      // Unique constraint violation
      if (error.details.includes('cpf')) {
        alert('Este CPF já está cadastrado.');
      } else if (error.details.includes('rg')) {
        alert('Este RG já está cadastrado.');
      } else {
        alert('Este cliente já está cadastrado.');
      }
    } else if (error.code === '42501') {
      // Row level security violation
      alert(
        'Você não tem permissão para cadastrar clientes. Por favor, entre em contato com o desenvolvedor.',
      );
    } else {
      alert('Erro ao cadastrar cliente. Por favor, tente novamente.');
    }
    console.error('Error details:', error);
  };

  const onSubmit = async (data, e) => {
    setIsSubmitting(true);
    try {
      const clientData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        contact_phone: data.contactPhone,
        cpf: data.cpf,
        rg: data.rg,
        cep: data.cep,
        address: data.address,
        address_number: data.addressNumber,
        city: data.city,
        state: data.state,
        father_name: data.fatherName,
        mother_name: data.motherName,
        birth_date: data.birthDate,
        created_by: 'nata',
      };

      let result;
      if (id) {
        // Update existing client
        result = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', id)
          .select();
      } else {
        // Insert new client
        result = await supabase.from('clients').insert([clientData]).select();
      }

      const { data: updatedClient, error } = result;

      if (error) throw error;

      console.log('Client operation successful:', updatedClient);
      notify.success(
        id
          ? 'Cliente atualizado com sucesso!'
          : 'Cliente cadastrado com sucesso!',
      );
      if (!id) {
        e.target.reset(); // Only reset the form for new clients
      }
      navigate(`/clientInformation/${insertedClient.id}`);
    } catch (error) {
      console.error('Error operating on client:', error);
      notify.error('Erro ao cadastrar cliente. Por favor, tente novamente.');
      handleSupabaseError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCEP = async (cep) => {
    // Remove qualquer caractere que não seja número (como o hífen)
    const cleanCep = cep.replace(/\D/g, '');

    // Expressão regular para validar o CEP
    const validacep = /^[0-9]{8}$/;

    // Valida o formato do CEP
    if (validacep.test(cleanCep)) {
      try {
        const response = await ky.get(
          `https://viacep.com.br/ws/${cleanCep}/json/`,
        );
        const data = await response.json();

        if (data.erro) {
          // Exibe um erro caso o CEP não seja encontrado
          setError('cep', {
            type: 'manual',
            message: 'CEP não encontrado.',
          });
          return;
        } else {
          clearErrors('cep');
          // Preenche os campos do formulário com os dados retornados
          setValue('address', data.logradouro);
          setValue('city', data.localidade);
          setValue('state', data.uf);
        }
      } catch (error) {
        setError('cep', {
          type: 'manual',
          message: `Erro ao buscar o CEP: '${cleanCep}`,
        });
        console.error('Erro ao buscar o CEP:', error);
      }
    } else {
      // Caso o CEP seja inválido, exibe uma mensagem de erro
      setError('cep', {
        type: 'manual',
        message: 'Formato de CEP inválido!',
      });
    }
  };

  return (
    <>
      <CustomSeparator title={id ? 'Editar Cliente' : 'Cadastrar Cliente'} />
      <div className="p-6">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-12">
              <div className="border-b border-gray-900/10 pb-12">
                <div className="px-4 sm:px-0">
                  <h3 className="text-xl font-semibold leading-7 text-gray-900">
                    Informações Pessoais
                  </h3>
                </div>
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  {/* Nome */}
                  <div className="sm:col-span-2 ">
                    <label
                      htmlFor="first-name"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Nome*
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('firstName')}
                        id="first-name"
                        type="text"
                        defaultValue={clientData?.firstName || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.firstName && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sobrenome */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="last-name"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Sobrenome*
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('lastName')}
                        id="last-name"
                        type="text"
                        defaultValue={clientData?.lastName || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.lastName && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="phone"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Telefone*
                    </label>
                    <div className="mt-2">
                      <input
                        {...registerWithMask('phone', '(9{2}) 9{5}-9{4}')}
                        id="phone"
                        type="text"
                        defaultValue={clientData?.phone || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.phone && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Telefone para contato */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="contact-phone"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Telefone para contato
                    </label>
                    <div className="mt-2">
                      <input
                        {...registerWithMask('contactPhone', '(9{2})9{5}-9{4}')}
                        id="contact-phone"
                        type="text"
                        defaultValue={clientData?.contactPhone || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                    </div>
                  </div>

                  {/* CPF */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="cpf"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      CPF*
                    </label>
                    <div className="mt-2">
                      <input
                        {...registerWithMask('cpf', 'cpf')}
                        id="cpf"
                        type="text"
                        defaultValue={clientData?.cpf || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.cpf && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.cpf.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RG */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="rg"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      RG*
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('rg')}
                        id="rg"
                        type="text"
                        defaultValue={clientData?.rg || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {/* {errors.rg && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.rg.message}
                        </p>
                      )} */}
                    </div>
                  </div>

                  {/* Nome do pai */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="father-name"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Nome do Pai
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('fatherName')}
                        id="father-name"
                        type="text"
                        defaultValue={clientData?.fatherName || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.fatherName && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.fatherName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Nome da mae */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="mother-name"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Nome do Mãe*
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('motherName')}
                        id="mother-name"
                        type="text"
                        defaultValue={clientData?.motherName || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.motherName && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.motherName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Data de nascimento */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="birth-date"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Data de nascimento*
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('birthDate')}
                        id="birth-date"
                        type="date"
                        defaultValue={clientData?.birthDate || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.birthDate && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.birthDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CEP */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="cep"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      CEP*
                    </label>
                    <div className="mt-2">
                      <input
                        {...registerWithMask('cep', '9{5}-9{3}')}
                        id="cep"
                        type="text"
                        defaultValue={clientData?.cep || ''}
                        onBlur={(e) => getCEP(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.cep && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.cep.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Endereço*
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('address')}
                        id="address"
                        type="text"
                        defaultValue={clientData?.address || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.address && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Numero casa */}
                  <div className="col-span-2">
                    <label
                      htmlFor="addressNumber"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Número
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('addressNumber')}
                        id="addressNumber"
                        type="text"
                        defaultValue={clientData?.addressNumber || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                    </div>
                  </div>

                  {/* Cidade */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="city"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Cidade*
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('city')}
                        id="city"
                        type="text"
                        defaultValue={clientData?.city || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.city && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="state"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      Estado*
                    </label>
                    <div className="mt-2">
                      <input
                        {...register('state')}
                        id="state"
                        type="text"
                        defaultValue={clientData?.state || ''}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-lg sm:leading-6"
                      />
                      {errors.state && (
                        <p className="p-2 mb-4 mt-2 text-base font-medium text-red-800 bg-red-50">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-xl font-bold leading-7 text-gray-900 "
                onClick={() => reset()}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-5 py-3 text-xl font-bold text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light"
              >
                {isSubmitting ? 'Salvando...' : id ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
