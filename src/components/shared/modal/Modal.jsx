import { Modal as MuiModal } from '@mui/material';
import { styled } from '@mui/material/styles';
//       viewBox="0 0 100 100"
//       width="100%"
//       height="100%"
//       className={clsx('animated-tick', className)}
export const Modal = styled(MuiModal)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    backgroundColor: theme.palette.background.default,
  },
}));