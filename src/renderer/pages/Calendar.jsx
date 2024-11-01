import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from '../services/supabaseClient';
import { notify } from '../utils/toast';
import AppointmentModal from '../components/AppointmentModal';
import { useAuth } from '../services/Auth';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data: appointmentsData, error } = await supabase.from(
        'appointments',
      ).select(`
          *,
          clients (
            first_name,
            last_name
          )
        `);

      if (error) throw error;

      // Transform appointments into calendar events
      const calendarEvents = appointmentsData.map((appointment) => ({
        id: appointment.id,
        title: `${appointment.clients.first_name} ${appointment.clients.last_name}`,
        start: appointment.date,
        description: appointment.description,
        backgroundColor: '#10B981', // You can use your primary color here
        borderColor: '#059669',
      }));

      setEvents(calendarEvents);
    } catch (error) {
      notify.error('Error fetching appointments');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    notify.success(
      <div>
        <strong>{event.title}</strong>
        <br />
        {event.extendedProps.description}
      </div>,
    );
  };

  const handleDateSelect = (selectInfo) => {
    // Only allow selecting future dates
    if (new Date(selectInfo.start) < new Date()) {
      notify.error('Não é possível criar atendimentos no passado');
      return;
    }

    setSelectedDate(selectInfo.startStr);
    setShowModal(true);
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            ...appointmentData,
            created_by: user.id,
          },
        ])
        .select(
          `
          *,
          clients (
            first_name,
            last_name
          )
        `,
        )
        .single();

      if (error) throw error;

      // Add the new event to the calendar
      const newEvent = {
        id: data.id,
        title: `${data.clients.first_name} ${data.clients.last_name}`,
        start: data.date,
        description: data.description,
        backgroundColor: '#10B981',
        borderColor: '#059669',
      };

      setEvents([...events, newEvent]);
      notify.success('Atendimento criado com sucesso!');
    } catch (error) {
      console.error('Error creating appointment:', error);
      notify.error('Erro ao criar atendimento');
    }
  };

  return (
    <div className="h-full p-4">
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4 h-full">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            eventClick={handleEventClick}
            height="100%"
            locale="pt-br"
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
            }}
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            allDaySlot={false}
            slotDuration="00:30:00"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '08:00',
              endTime: '18:00',
            }}
            selectable={true}
            select={handleDateSelect}
          />
          <AppointmentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            date={selectedDate}
            onSave={handleSaveAppointment}
          />
        </div>
      )}
    </div>
  );
}
