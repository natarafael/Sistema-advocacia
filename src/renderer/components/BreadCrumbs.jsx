import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';

export default function CustomSeparator(props) {
  const { title, ...otherProps } = props;

  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();
    navigate('/'); // Navega para a página de cadastro de usuário
  };

  const breadcrumbs = [
    <Link underline="hover" key="1" color="inherit" onClick={handleClick}>
      <Typography sx={{ fontSize: '16px' }}>Inicio</Typography>
    </Link>,
    <Typography key="3" sx={{ color: 'text.primary', fontSize: '16px' }}>
      {title}
    </Typography>,
  ];

  return (
    <div className="pt-8 bg-secondary-light w-full p-4 border-2 border-b-secondary-dark">
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="medium" />}
        aria-label="breadcrumb"
        {...otherProps}
      >
        {breadcrumbs}
      </Breadcrumbs>
    </div>
  );
}
