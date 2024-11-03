import { Box } from '@mui/material';
import CustomSeparator from '../components/BreadCrumbs';
import AddIcon from '@mui/icons-material/Add';
import ClientsTable from '../components/ClientsTable';
import PageHeader from '../components/PageHeader';
import ButtonW from '../components/wrapper/ButtonW';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/clientRegistration'); // Navega para a página de cadastro de usuário
  };

  return (
    <>
      <CustomSeparator title={'Clientes'} />
      <div className="p-4">
        <div className="pb-2 flex justify-between items-center mb-4">
          <PageHeader title={'Clientes Cadastrados'} />
          <Box>
            <ButtonW onClick={handleClick} startIcon={<AddIcon />}>
              <p className="text-lg">Cadastrar Cliente</p>
            </ButtonW>
          </Box>
        </div>
        <ClientsTable />
      </div>
    </>
  );
};

export default Home;
