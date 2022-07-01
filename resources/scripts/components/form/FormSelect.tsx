import { Controller, ControllerProps } from 'react-hook-form';
import BaseSelect from '@components/base/Select';
import React from 'react';

export interface FormSelectProps extends Partial<ControllerProps> {
  control: any;
  className?: string;
  placeholder?: string;
  name: string;
  disabled?: boolean;
  options: Array<any>;
}

const FormSelect = (props: FormSelectProps) => {
  const { options, disabled = false, ...restProps } = props;

  return (
    <Controller
      {...restProps}
      render={({
        field: { onChange, onBlur, value, name }
      }) => (
        <BaseSelect
          onChange={onChange}
          onBlur={onBlur}
          options={options}
          value={value}
          name={name}
          disabled={disabled}
        />
      )}
    />);
};

export default FormSelect;
