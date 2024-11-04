import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import FormattedNumberInput from './FormattedNumberInput';
import {
  useMaterialReactTable,
  MaterialReactTable,
  MRT_ToggleFullScreenButton,
  MRT_ShowHideColumnsButton,
} from 'material-react-table';
import { supabase } from '../services/supabaseClient';
import { useParams } from 'react-router-dom';
import { notify } from '../utils/toast';

const paymentSchema = yup.object().shape({
  contractDate: yup.date().required('Data de Contrato é um campo obrigatório.'),
  totalValue: yup
    .string()
    .transform((value) => value.replace(/[^\d]/g, ''))
    .required('Valor Total é um campo obrigatório.'),
  installmentsNumber: yup
    .number()
    .required('Número de parcelas é um campo obrigatório.'),
  dueDate: yup.date().required('Data de vencimento é um campo obrigatório.'),
});

const Payments = React.forwardRef((props, ref) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      totalValue: '',
      installmentsNumber: 1,
      contractDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split('T')[0],
    },
  });

  const { id: clientId } = useParams();

  const [installments, setInstallments] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  useEffect(() => {
    fetchPaymentPlans();
    fetchPaymentHistory();
  }, [clientId]);

  const fetchPaymentPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_plans')
        .select('*, installments(*)')
        .eq('client_id', clientId);

      if (error) throw error;

      setPaymentPlans(data);
      if (data.length > 0) {
        setCurrentPlanId(data[0].id);
        setInstallments(data[0].installments);
        setTotalValue(data[0].total_value);
        calculateRemainingBalance(data[0].installments);
      }
    } catch (error) {
      console.error('Error fetching payment plans:', error);
      notify.error('Erro ao carregar planos de pagamentos');
    }
  };

  const parseNumber = (str) => {
    if (str === null || str === undefined) return '';
    return str.replace(/\./g, '').replace(',', '.');
  };

  const handleAdditionalPayment = async (amount) => {
    try {
      const paymentDate = new Date().toISOString().split('T')[0];

      // Parse the amount, handling both comma and dot as decimal separators
      const parsedAmount = parseFloat(parseNumber(amount)) || 0;

      if (parsedAmount <= 0) {
        console.error('Invalid payment amount');
        notify.error('Valor de pagamento invalido, tente novamente');
        return;
      }

      console.log('Parsed additional payment amount:', parsedAmount); // For debugging

      let remainingPayment = parsedAmount;
      const updatedInstallments = [...installments];

      for (let i = 0; i < updatedInstallments.length; i++) {
        const installment = updatedInstallments[i];
        if (remainingPayment <= 0) break;

        const unpaidAmount =
          parseFloat(installment.installment_value) -
          parseFloat(installment.paid_amount);
        if (unpaidAmount > 0) {
          const paymentToApply = Math.min(remainingPayment, unpaidAmount);
          const newPaidAmount =
            parseFloat(installment.paid_amount) + paymentToApply;

          // Update installment in state
          updatedInstallments[i] = {
            ...installment,
            paid_amount: newPaidAmount.toFixed(2),
            status: newPaidAmount >= parseFloat(installment.installment_value),
          };

          // Update installment in Supabase
          const { error } = await supabase
            .from('installments')
            .update({
              paid_amount: newPaidAmount.toFixed(2),
              status: updatedInstallments[i].status,
            })
            .eq('id', installment.id);

          if (error) throw error;

          // Add to payment history
          const { error: historyError } = await supabase
            .from('payment_history')
            .insert({
              installment_id: installment.id,
              payment_date: paymentDate,
              amount: paymentToApply.toFixed(2),
              difference: paymentToApply.toFixed(2),
            });

          if (historyError) throw historyError;

          remainingPayment = parseFloat(
            (remainingPayment - paymentToApply).toFixed(2),
          );
        }
      }

      setInstallments(updatedInstallments);
      calculateRemainingBalance(updatedInstallments);
      await fetchPaymentHistory();

      // Reset the additional payment input
      setValue('additionalPayment', '');

      console.log('Updated remaining balance:', remainingBalance); // For debugging
    } catch (error) {
      console.error('Error processing additional payment:', error);
      notify.error('Erro ao processar pagamento adicional');
    }
  };

  const calculateRemainingBalance = (installments) => {
    const total = installments.reduce(
      (sum, inst) => sum + parseFloat(inst.installment_value),
      0,
    );
    const paid = installments.reduce(
      (sum, inst) => sum + parseFloat(inst.paid_amount),
      0,
    );
    setRemainingBalance(parseFloat((total - paid).toFixed(2)));
  };

  const onSubmit = async (data) => {
    try {
      const { contractDate, totalValue, installmentsNumber, dueDate } = data;

      const parsedTotalValue = parseFloat(parseNumber(totalValue));

      // Insert new payment plan
      const { data: newPlan, error: planError } = await supabase
        .from('payment_plans')
        .insert({
          client_id: clientId,
          contract_date: contractDate,
          total_value: parsedTotalValue,
          installments_number: installmentsNumber,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create installments
      const installmentValue = parsedTotalValue / installmentsNumber;
      const installmentsData = Array.from(
        { length: installmentsNumber },
        (_, index) => {
          const installmentDate = new Date(dueDate);
          if (index > 0) {
            installmentDate.setMonth(installmentDate.getMonth() + index);
          }

          return {
            payment_plan_id: newPlan.id,
            installment_number: index + 1,
            installment_value: installmentValue.toFixed(2),
            due_date: installmentDate.toISOString().split('T')[0],
            status: false,
            paid_amount: '0',
          };
        },
      );

      const { data: newInstallments, error: installmentsError } = await supabase
        .from('installments')
        .insert(installmentsData)
        .select();

      if (installmentsError) throw installmentsError;

      setCurrentPlanId(newPlan.id);
      setInstallments(newInstallments);
      setRemainingBalance(parsedTotalValue);
      setTotalValue(parsedTotalValue);
      fetchPaymentPlans(); // Refresh the payment plans list
      reset();
    } catch (error) {
      console.error('Error creating payment plan:', error);
      notify.error('Erro ao criar plano de pagamento');
    }
  };

  const handlePaymentUpdate = async (rowIndex, field, value) => {
    try {
      const updatedInstallment = { ...installments[rowIndex], [field]: value };

      if (field === 'paid_amount') {
        const paidAmount = parseFloat(value) || 0;
        updatedInstallment.status =
          paidAmount >= parseFloat(updatedInstallment.installment_value);

        // Update the installment in Supabase
        const { error } = await supabase
          .from('installments')
          .update({
            paid_amount: paidAmount,
            status: updatedInstallment.status,
          })
          .eq('id', updatedInstallment.id);

        if (error) throw error;

        // Add to payment history
        const { error: historyError } = await supabase
          .from('payment_history')
          .insert({
            installment_id: updatedInstallment.id,
            payment_date: new Date().toISOString().split('T')[0],
            amount: paidAmount,
            difference:
              paidAmount - parseFloat(installments[rowIndex].paid_amount),
          });

        if (historyError) throw historyError;

        // Fetch updated payment history
        await fetchPaymentHistory();
      }

      setInstallments(
        installments.map((inst, index) =>
          index === rowIndex ? updatedInstallment : inst,
        ),
      );
      calculateRemainingBalance(installments);
    } catch (error) {
      console.error('Error updating payment:', error);
      notify.error('Erro ao fazer update do pagamento');
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select(
          `
          *,
          installments(installment_number)
        `,
        )
        .in(
          'installment_id',
          installments.map((inst) => inst.id),
        )
        .order('payment_date', { ascending: false });

      if (error) throw error;

      setPaymentHistory(data);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      notify.error('Erro ao carregar histórico de pagamentos');
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'installment_number',
        header: 'Número da Parcela',
        size: 150,
        sortingFn: 'basic', // Use basic sorting for numbers
      },
      {
        accessorKey: 'installment_value',
        header: 'Valor da Parcela',
        size: 150,
        Cell: ({ cell }) => `R$ ${parseFloat(cell.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: 'due_date',
        header: 'Data de Vencimento',
        size: 200,
        Cell: ({ cell }) => {
          const date = new Date(cell.getValue());
          return date.toLocaleDateString('pt-BR'); // or your preferred locale
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 150,
        Cell: ({ cell }) => (
          <span className={cell.getValue() ? 'text-green-600' : 'text-red-600'}>
            {cell.getValue() ? 'Pago' : 'Pendente'}
          </span>
        ),
      },
      {
        accessorKey: 'paid_amount',
        header: 'Valor Pago',
        size: 150,
        Cell: ({ cell }) => {
          const paidAmount = parseFloat(cell.getValue() || 0);
          return `R$ ${paidAmount.toFixed(2)}`;
        },
      },
    ],
    [control, handlePaymentUpdate],
  );

  const table = useMaterialReactTable({
    columns,
    data: installments,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: true, // Enable sorting
    enableBottomToolbar: false,
    enableTopToolbar: true,
    initialState: {
      sorting: [
        { id: 'installment_number', desc: false }, // Sort by installment number in ascending order
      ],
    },
    renderTopToolbarCustomActions: () => (
      <div className="flex items-center gap-2">
        <MRT_ToggleFullScreenButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
      </div>
    ),
  });

  return (
    <div className="space-y-8" ref={ref}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="contract-date"
              className="block text-sm font-medium text-gray-700 pt-2"
            >
              Data de Contrato
            </label>
            <input
              {...register('contractDate')}
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary-light sm:text-sm"
            />
            {errors.contractDate && (
              <p className="mt-2 text-sm text-red-600">
                {errors.contractDate.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <FormattedNumberInput
              control={control}
              name="totalValue"
              label="Valor Total"
              prefix="R$ "
            />
            {errors.totalValue && (
              <p className="mt-2 text-sm text-red-600">
                {errors.totalValue.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="installments-number"
              className="block text-sm font-medium text-gray-700"
            >
              Número de Parcelas
            </label>
            <input
              {...register('installmentsNumber')}
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary-light sm:text-sm"
            />
            {errors.installmentsNumber && (
              <p className="mt-2 text-sm text-red-600">
                {errors.installmentsNumber.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="due-date"
              className="block text-sm font-medium text-gray-700"
            >
              Data de Vencimento
            </label>
            <input
              {...register('dueDate')}
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary-light sm:text-sm"
            />
            {errors.dueDate && (
              <p className="mt-2 text-sm text-red-600">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-lg font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2"
          >
            Gerar Parcelas
          </button>
        </div>
      </form>

      <div className="mb-4">
        <label
          htmlFor="payment-plan"
          className="block text-sm font-medium text-gray-700"
        >
          Selecionar Plano de Pagamento
        </label>
        <select
          id="payment-plan"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm rounded-md"
          value={currentPlanId || ''}
          onChange={(e) => {
            const selectedPlan = paymentPlans.find(
              (plan) => plan.id === parseInt(e.target.value),
            );
            setCurrentPlanId(selectedPlan.id);
            setInstallments(selectedPlan.installments);
            setTotalValue(selectedPlan.total_value);
            calculateRemainingBalance(selectedPlan.installments);
          }}
        >
          {paymentPlans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              Plano {plan.id} -{' '}
              {new Date(plan.contract_date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <MaterialReactTable table={table} />

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Histórico de Pagamentos</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diferença
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número da Parcela
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paymentHistory.map((payment, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(payment.payment_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {parseFloat(payment.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  R$ {parseFloat(payment.difference).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.installments?.installment_number || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">
          Valor Total: R$ {totalValue.toFixed(2)}
        </h2>
        <h2 className="text-lg font-semibold">
          Saldo Restante: R$ {remainingBalance.toFixed(2)}
        </h2>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Pagamentos Adicionais</h2>
        <div className="flex items-end space-x-4">
          <FormattedNumberInput
            control={control}
            name="additionalPayment"
            label="Valor do Pagamento"
            prefix="R$ "
          />
          <button
            onClick={() =>
              handleAdditionalPayment(getValues('additionalPayment'))
            }
            className="inline-flex justify-center rounded-md  border border-transparent bg-primary py-2 px-4 text-lg font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
});

export default Payments;
