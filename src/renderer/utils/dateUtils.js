// dateUtils.js

/**
 * Formats a date string to local Brazilian format without timezone issues
 */
export const formatLocalDate = (dateString) => {
  const date = new Date(dateString);
  return new Date(
    date.getTime() + date.getTimezoneOffset() * 60000,
  ).toLocaleDateString('pt-BR');
};

/**
 * Formats a date string to include time in Brazilian format
 */
export const formatLocalDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Date(
    date.getTime() + date.getTimezoneOffset() * 60000,
  ).toLocaleString('pt-BR');
};

/**
 * Checks if a date is in the past
 */
export const isDatePast = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Combines a date and time string into an ISO string
 */
export const combineDateAndTime = (dateString, timeString) => {
  const date = new Date(dateString);
  const [hours, minutes] = timeString.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date.toISOString();
};

/**
 * Gets time from date string in HH:mm format
 */
export const getTimeFromDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Formats a date for input[type="date"] value
 */
export const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};
