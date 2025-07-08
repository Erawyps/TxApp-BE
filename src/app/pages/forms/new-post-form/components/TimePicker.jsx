import { forwardRef } from 'react';
import { Input } from 'components/ui';

const TimePicker = forwardRef(({ value, onChange, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      type="time"
      value={value}
      onChange={onChange}
      {...props}
    />
  );
});

TimePicker.displayName = 'TimePicker';

export { TimePicker };