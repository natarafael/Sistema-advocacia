import React from 'react';
import { Button } from '@mui/material';

const ButtonW = (props) => {
  const {
    primary,
    secondary,
    error,
    className,
    children,
    variant,
    color,
    ...otherProps
  } = props;

  const handleColor = () => {
    if (color) return color;
    if (primary) return 'primary';
    if (secondary) return 'secondary';
    if (error) return 'error';
    return 'primary';
  };

  const handleVariant = () => {
    if (!error) {
      if (variant) {
        return variant;
      }
      return 'contained';
    }
    if (variant) return variant;
    return 'outlined';
  };

  return (
    <Button variant={handleVariant()} color={handleColor()} {...otherProps}>
      {children}
    </Button>
  );
};

export default ButtonW;
