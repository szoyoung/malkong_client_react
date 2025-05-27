import { styled } from '@mui/material/styles';

// Styled Components
export const PageContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1200,
  margin: '0 auto',
}));

export const FormContainer = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  maxWidth: 400,
  margin: '0 auto',
  padding: theme.spacing(3),
}));

export const CardContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
}));

// Material-UI Style Objects
export const styles = {
  pageContainer: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 3,
    marginBottom: 2,
  },
}; 