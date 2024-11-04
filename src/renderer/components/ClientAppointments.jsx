import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../services/Auth';
import { notify } from '../utils/toast';
import { UserIcon } from '@heroicons/react/24/outline';
import ConfirmationDialog from './ConfirmationDialog';

export default function ClientAppointments({ clientId }) {
  const [appointments, setAppointments] = useState([]);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    description: '',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [clientId]);

  const fetchAppointments = async () => {
    try {
      // Get appointments with user IDs
      const { data: appointmentsData, error: appointmentsError } =
        await supabase
          .from('appointments')
          .select('*')
          .eq('client_id', clientId)
          .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Get profiles for those users
      const userIds = appointmentsData.map((app) => app.created_by);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const combinedData = appointmentsData.map((appointment) => {
        const creator = profilesData.find(
          (profile) => profile.id === appointment.created_by,
        );
        return {
          ...appointment,
          creator: creator?.username || 'Unknown User',
        };
      });

      setAppointments(combinedData);
    } catch (error) {
      notify.error('Error fetching appointments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            client_id: clientId,
            created_by: user.id,
            date: new Date(newAppointment.date).toISOString(),
            description: newAppointment.description,
          },
        ])
        .select();

      if (error) throw error;

      // Get the creator's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      // Add the creator information to the new appointment
      const newAppointmentWithCreator = {
        ...data[0],
        creator: profileData?.username || 'Unknown User',
      };

      setAppointments([newAppointmentWithCreator, ...appointments]);
      setNewAppointment({ date: '', description: '' });
      setShowForm(false);
      notify.success('Atendimento adicionado com sucesso!');
    } catch (error) {
      notify.error('Erro ao adicionar atendimento');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(appointments.filter((app) => app.id !== appointmentId));
      notify.success('Atendimento deletado com sucesso!');
    } catch (error) {
      notify.error('Erro ao deletar atendimento');
      console.error('Error:', error);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Atendimentos</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-3 py-2 text-lg font-semibold text-white shadow-sm hover:bg-primary-light"
        >
          {showForm ? 'Cancelar' : 'Adicionar Atendimento'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-gray-50 p-4 rounded-lg"
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Data e Hora
              </label>
              <input
                type="datetime-local"
                value={newAppointment.date}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    date: e.target.value,
                  })
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
                value={newAppointment.description}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-2 text-lg font-semibold text-white shadow-sm hover:bg-primary-light"
              >
                Salvar Atendimento
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div>Carregando...</div>
      ) : appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm text-gray-500">
                    {new Date(appointment.date).toLocaleString()}
                  </div>
                  <div className="mt-1 text-sm text-gray-900">
                    {appointment.description}
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <UserIcon className="h-4 w-4 mr-1" />
                    <span>
                      Criado por:{' '}
                      {appointment.creator || 'Usuário Desconhecido'}
                    </span>
                  </div>
                </div>
                {user.id === appointment.created_by && (
                  <button
                    onClick={() => {
                      setAppointmentToDelete(appointment.id);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm ml-4"
                  >
                    Deletar
                  </button>
                )}
              </div>
            </div>
          ))}
          <ConfirmationDialog
            isOpen={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false);
              setAppointmentToDelete(null);
            }}
            onConfirm={() => handleDelete(appointmentToDelete)}
            title="Deletar Atendimento"
            description="Você tem certeza que deseja deletar este atendimento?"
            confirmText="Deletar"
            cancelText="Cancelar"
            isDangerous={true}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          Nenhum Atendimento Registrado
        </div>
      )}
    </div>
  );
}
