import { useForm } from 'react-hook-form';

const FullForm = ({ children }) => {
    const { control } = useForm();
    return <div>{children({ control })}</div>;
};

export default FullForm;