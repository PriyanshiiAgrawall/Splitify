import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack, TextField, Grid, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import Iconify from '../Iconify';
import PropTypes from 'prop-types';
import AlertBanner from '../AlertBanner';

import { editUser } from '../../services/authentication'; //implement this 
import useResponsive from '../theme/hooks/useResponsive';


EditForm.propTypes = {
  hideEditUser: PropTypes.func,
  emailId: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  showHomeAlert: PropTypes.func,
  homeAlertMessage: PropTypes.string,
};

export default function EditForm({ hideEditUser, emailId, firstName, lastName, showHomeAlert, homeAlertMessage }) {
  const smUp = useResponsive('up', 'sm');

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const EditSchema = z.object({
    firstName: z.string().nonempty('First Name is required'),
    lastName: z.string().nonempty('Last Name is required'),
  });


  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      emailId,
      firstName,
      lastName,
    },
    resolver: zodResolver(EditSchema),
  });

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      console.log(data);
      const payload = {
        ...data, emailId: emailId
      }
      const updateResponse = await editUser(payload, setShowAlert, setAlertMessage, showHomeAlert, homeAlertMessage);
      if (updateResponse) {
        hideEditUser();
      }
    } catch (error) {
      setShowAlert(true);
      setAlertMessage('Failed to update user.');
    }
  };

  return (
    <>
      <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <AlertBanner showAlert={showAlert} alertMessage={alertMessage} severity="error" />
          <Stack
            spacing={3}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            {/* First Name */}
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="text"
                  label="First Name"
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName?.message}
                />
              )}
            />

            {/* Last Name */}
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="text"
                  label="Last Name"
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Stack>
        </Stack>

        {/* Action Buttons */}
        <Grid container spacing={2} mt={2} justifyContent="center">
          <Grid item md={6} xs={11}>
            <Button
              startIcon={<Iconify icon="material-symbols:cancel" />}
              size="large"
              onClick={hideEditUser}
              variant="outlined"
              color="error"
              sx={{ width: '100%' }}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item md={6} xs={11}>
            <LoadingButton
              startIcon={<Iconify icon="teenyicons:tick-circle-solid" />}
              fullWidth
              size="large"
              type="submit"
              variant="outlined"
              loading={isSubmitting}
            >
              Update
            </LoadingButton>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
