import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { notify } from '../utils/toast';
import { formatLocalDate } from '../utils/dateUtils';

export default function AppointmentModal({ isOpen, onClose, date, onSave }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientId: '',
    description: '',
    time: '09:00', // Default time
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setFormData({
        clientId: '',
        description: '',
        time: '09:00',
      });
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .order('first_name');

      if (error) throw error;
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      notify.error('Error loading clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description) {
      notify.error('Por favor adicione uma descrição');
      return;
    }

    try {
      // Combine the selected date with the time
      const selectedDate = new Date(date);
      const [hours, minutes] = formData.time.split(':');
      selectedDate.setHours(parseInt(hours), parseInt(minutes), 0);

      const appointment = {
        client_id: formData.clientId || null,
        date: selectedDate.toISOString(),
        description: formData.description,
      };

      await onSave(appointment);
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      notify.error('Erro ao criar atendimento');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Novo Atendimento</h2>
        <p className="text-gray-600 mb-4">{formatLocalDate(date)}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Horário*
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              min="08:00"
              max="18:00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cliente (opcional)
            </label>
            <select
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">Selecione um cliente (opcional)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descrição*
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-md"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
