import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'components/ui';

const TimePicker = forwardRef(({ value, onChange, error, label, placeholder, ...rest }, ref) => {
  return (
    <Input
      ref={ref}
      label={label}
      placeholder={placeholder || "HH:MM"}
      value={value}
      onChange={(e) => {
        // Validation basique du format
        const val = e.target.value;
        if (val === "" || /^([0-1]?[0-9]|2[0-3]):?([0-5]?[0-9])?$/.test(val)) {
          // Ajout automatique du ":" si nécessaire
          const formattedValue = val.length === 2 && !val.includes(':') 
            ? `${val}:` 
            : val;
          onChange(formattedValue);
        }
      }}
      onBlur={(e) => {
        // Formatage final au blur
        const val = e.target.value;
        if (val.includes(':') && val.length === 4) {
          onChange(val.padEnd(5, '0'));
        } else if (!val.includes(':') && val.length === 3) {
          onChange(`${val.slice(0, 2)}:${val.slice(2)}0`);
        } else if (!val.includes(':') && val.length === 4) {
          onChange(`${val.slice(0, 2)}:${val.slice(2)}`);
        }
      }}
      error={error}
      maxLength={5}
      {...rest}
    />
  );
});

TimePicker.displayName = 'TimePicker';

TimePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  label: PropTypes.node,
  placeholder: PropTypes.string
};

export { TimePicker };