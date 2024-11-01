import toast from 'react-hot-toast';

export const notify = {
  success: (message) =>
    toast.success(message, {
      className: 'font-medium',
    }),

  error: (message) =>
    toast.error(message, {
      className: 'font-medium',
    }),

  loading: (message) =>
    toast.loading(message, {
      className: 'font-medium',
    }),

  promise: async (promise, msgs = {}) =>
    toast.promise(
      promise,
      {
        loading: msgs.loading || 'Carregando...',
        success: msgs.success || 'Sucesso!',
        error: msgs.error || 'Erro!',
      },
      {
        className: 'font-medium',
      },
    ),

  dismiss: toast.dismiss,
};
