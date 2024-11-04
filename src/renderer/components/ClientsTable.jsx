import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import {
  useMaterialReactTable,
  MaterialReactTable,
} from 'material-react-table';
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import { useNavigate } from 'react-router-dom';
import { notify } from '../utils/toast';

const CustomInput = styled(InputBase)(({ theme }) => ({
  'label + &': {
    marginTop: theme.spacing(3),
  },
  '& .MuiInputBase-input': {
    position: 'relative',
    boxSizing: 'border-box', // Ensures padding doesn't break layout
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:focus': {
      borderColor: 'inherit',
      boxShadow: 'none',
    },
    height: '100%',
  },
}));

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    getClients();
  }, []);

  async function getClients() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('clients').select('*');

      if (error) throw error;
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error.message);
      notify.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'first_name',
        header: 'Nome',
        size: 150,
      },
      {
        accessorKey: 'last_name',
        header: 'Sobrenome',
        size: 150,
      },
      {
        accessorKey: 'address',
        header: 'Endereço',
        size: 200,
      },
      {
        accessorKey: 'city',
        header: 'Cidade',
        size: 150,
      },
      {
        accessorKey: 'state',
        header: 'Estado',
        size: 150,
      },
      {
        accessorKey: 'phone',
        header: 'Telefone',
        size: 150,
      },
      {
        accessorKey: 'cpf',
        header: 'CPF',
        size: 150,
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: clients, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    initialState: {
      density: 'spacious',
      showGlobalFilter: true,
      // columnVisibility: { state: false },
    },
    state: { isLoading },
    enableDensityToggle: false,
    enableHiding: false,
    enableFullScreenToggle: false,
    enableColumnFilters: false,
    showGlobalFilter: true,
    positionGlobalFilter: 'right',
    muiSearchTextFieldProps: {
      placeholder: 'Pesquisar',
      height: '60px', // Adjust height
      sx: { minWidth: '300px', width: '400px' },
      InputProps: {
        inputComponent: CustomInput, // Use the styled custom input
      },
    },
    enableRowActions: false,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        navigate(`/clientInformation/${row.original.id}`);
      },
      style: {
        cursor: 'pointer',
      },
    }),
  });

  return <MaterialReactTable table={table} />;
};

export default ClientsTable;
