import { forwardRef } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useLocaleContext } from 'app/contexts/locale/context';
import { useFormContext } from 'react-hook-form';

const TimePicker = forwardRef(({ name, label, ...props }, ref) => {
    const { locale } = useLocaleContext();
    const { register, setValue, watch } = useFormContext();
    const value = watch(name);
    
    const handleChange = (event) => {
        const time = event.target.value;
        setValue(name, dayjs(time, 'HH:mm').locale(locale).toDate());
    };
    
    return (
        <div className="form-group">
        <label htmlFor={name} className="form-label">
            {label}
        </label>
        <input
            type="time"
            id={name}
            name={name}
            ref={ref}
            {...register(name)}
            value={dayjs(value).format('HH:mm')}
            onChange={handleChange}
            {...props}
        />
        </div>
    );
    }
);
TimePicker.displayName = 'TimePicker';
TimePicker.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
};
TimePicker.defaultProps = {
    label: '',
};
export default TimePicker;