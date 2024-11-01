import React from 'react';
import { Controller } from 'react-hook-form';

const FormattedNumberInput = ({
  control,
  name,
  label = 'Price',
  prefix = 'R$ ',
}) => {
  const formatNumber = (num) => {
    if (num === null || num === undefined || num === '') return '';
    // Remove any non-digit or non-comma character
    num = num.replace(/[^\d,]/g, '');
    // Split the integer and decimal parts
    let [integerPart, decimalPart] = num.split(',');
    // Format the integer part with thousand separators
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    // Combine the parts, ensuring only two decimal places
    return decimalPart
      ? `${integerPart},${decimalPart.slice(0, 2)}`
      : integerPart;
  };

  const parseNumber = (str) => {
    if (str === null || str === undefined) return '';
    return str.replace(/\./g, '').replace(',', '.');
  };

  const handleChange = (event, onChange) => {
    const value = event.target.value;
    const formattedValue = formatNumber(value);
    onChange(formattedValue);
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref } }) => (
        <div>
          <label
            htmlFor={name}
            className="block text-lg font-medium leading-6 text-gray-900"
          >
            {label}
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">{prefix}</span>
            </div>
            <input
              type="text"
              id={name}
              name={name}
              value={formatNumber(value) || ''}
              onChange={(e) => handleChange(e, onChange)}
              ref={ref}
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-light sm:text-sm sm:leading-6"
              placeholder="0,00"
            />
          </div>
        </div>
      )}
    />
  );
};

export default FormattedNumberInput;
