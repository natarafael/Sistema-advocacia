// // This table can be more costumizable

// import {
//   MRT_GlobalFilterTextField,
//   MRT_TablePagination,
//   useMaterialReactTable,
//   MRT_TableContainer,
// } from 'material-react-table';
// import { Box, Button } from '@mui/material';
// import { useMemo } from 'react';
// import { styled } from '@mui/material/styles';
// import InputBase from '@mui/material/InputBase';

// const CustomInput = styled(InputBase)(({ theme }) => ({
//   'label + &': {
//     marginTop: theme.spacing(3),
//   },
//   '& .MuiInputBase-input': {
//     position: 'relative',
//     boxSizing: 'border-box', // Ensures padding doesn't break layout
//     transition: theme.transitions.create(['border-color', 'box-shadow']),
//     '&:focus': {
//       borderColor: 'inherit',
//       boxShadow: 'none',
//     },
//   },
// }));

// const data = [
//   {
//     name: {
//       firstName: 'John',
//       lastName: 'Doe',
//     },
//     address: '261 Erdman Ford',
//     city: 'East Daphne',
//     state: 'Kentucky',
//   },
//   {
//     name: {
//       firstName: 'Jane',
//       lastName: 'Doe',
//     },
//     address: '769 Dominic Grove',
//     city: 'Columbus',
//     state: 'Ohio',
//   },
//   {
//     name: {
//       firstName: 'Joe',
//       lastName: 'Doe',
//     },
//     address: '566 Brakus Inlet',
//     city: 'South Linda',
//     state: 'West Virginia',
//   },
//   {
//     name: {
//       firstName: 'Kevin',
//       lastName: 'Vandy',
//     },
//     address: '722 Emie Stream',
//     city: 'Lincoln',
//     state: 'Nebraska',
//   },
//   {
//     name: {
//       firstName: 'Joshua',
//       lastName: 'Rolluffs',
//     },
//     address: '32188 Larkin Turnpike',
//     city: 'Charleston',
//     state: 'South Carolina',
//   },
// ];

// const CustomTable = () => {
//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: 'name.firstName', //access nested data with dot notation
//         header: 'First Name',
//         size: 150,
//       },
//       {
//         accessorKey: 'name.lastName',
//         header: 'Last Name',
//         size: 150,
//       },
//       {
//         accessorKey: 'address', //normal accessorKey
//         header: 'Address',
//         size: 200,
//       },
//       {
//         accessorKey: 'city',
//         header: 'City',
//         size: 150,
//       },
//       {
//         accessorKey: 'state',
//         header: 'State',
//         size: 150,
//       },
//     ],
//     [],
//   );

//   const table = useMaterialReactTable({
//     columns,
//     data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
//     initialState: { density: 'spacious', showGlobalFilter: true },
//     enableDensityToggle: false,
//     enableHiding: false,
//     enableFullScreenToggle: false,
//     enableColumnFilters: false,
//     showGlobalFilter: true,
//     positionGlobalFilter: 'right',
//     muiSearchTextFieldProps: {
//       placeholder: 'Pesquisar',
//       sx: { minWidth: '300px' },
//       InputProps: {
//         inputComponent: CustomInput, // Use the styled custom input
//       },
//     },
//   });

//   return (
//     <Box sx={{ border: 'green 2px dashed', padding: '16px' }}>
//       {/* Our Custom External Top Toolbar */}
//       <Box
//         sx={(theme) => ({
//           display: 'flex',
//           backgroundColor: 'inherit',
//           borderRadius: '4px',
//           flexDirection: 'row',
//           gap: '16px',
//           justifyContent: 'space-between',
//           padding: '24px 16px',
//           '@media max-width: 768px': {
//             flexDirection: 'column',
//           },
//         })}
//       >
//         <Box>
//           <Button
//             color="primary"
//             onClick={() => {
//               alert('Adicionar usuario');
//             }}
//             variant="contained"
//           >
//             Cadastrar Usuário
//           </Button>
//         </Box>
//         <MRT_GlobalFilterTextField table={table} sx={{ width: '400px' }} />
//         {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <MRT_ToggleFiltersButton table={table} />
//           <MRT_ShowHideColumnsButton table={table} />
//           <MRT_ToggleDensePaddingButton table={table} />
//           <Tooltip title="Print">
//             <IconButton onClick={() => window.print()}>
//               <PrintIcon />
//             </IconButton>
//           </Tooltip>
//         </Box> */}
//       </Box>

//       <MRT_TableContainer table={table} />
//       {/* Custom Bottom Toolbar */}
//       <Box>
//         <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
//           <MRT_TablePagination table={table} />
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default CustomTable;
