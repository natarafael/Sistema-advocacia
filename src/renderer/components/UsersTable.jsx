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

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('profiles').select('*');

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      notify.error('Erro ao carregar Usuários');
    } finally {
      setIsLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'username',
        header: 'Nome de usuário',
        size: 150,
      },
      {
        accessorKey: 'name',
        header: 'Nome completo',
        size: 150,
      },
      {
        accessorKey: 'oab_number',
        header: 'Número OAB',
        size: 200,
      },
    ],
    [],
  );

  const table = useMaterialReactTable({
    columns,
    data: users, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
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
        navigate(`/profile`);
      },
      style: {
        cursor: 'pointer',
      },
    }),
  });

  return <MaterialReactTable table={table} />;
};

export default UsersTable;
