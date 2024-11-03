import { Box } from '@mui/material';
import CustomSeparator from '../components/BreadCrumbs';
import AddIcon from '@mui/icons-material/Add';
import PageHeader from '../components/PageHeader';
import ButtonW from '../components/wrapper/ButtonW';
import { useNavigate } from 'react-router-dom';
import UsersTable from '../components/UsersTable';

const UsersPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <CustomSeparator title={'Usuários'} />
      <div className="p-4">
        <div className="pb-2 flex justify-between items-center mb-4">
          <PageHeader title={'Usuários Cadastrados'} />
        </div>
        <UsersTable />
      </div>
    </>
  );
};

export default UsersPage;
