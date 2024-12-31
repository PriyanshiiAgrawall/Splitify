import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Stack, TextField, IconButton, InputAdornment, Grid, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import Iconify from '../Iconify';
import AlertBanner from '../AlertBanner';
import PropTypes from 'prop-types';
import useResponsive from '../theme/hooks/useResponsive';
import { updatePassword } from '../../services/authentication';

// ----------------------------------------------------------------------

ChangePassword.propTypes = {
  emailId: PropTypes.string,
  hidePassUpdate: PropTypes.func,
  showHomeAlert: PropTypes.func,
  homeAlertMessage: PropTypes.func,
};

export default function ChangePassword({ hidePassUpdate, emailId, showHomeAlert, homeAlertMessage }) {
  const smUp = useResponsive('up', 'sm');

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showPasswordOld, setShowPasswordOld] = useState(false);
  const [showPasswordNew, setShowPasswordNew] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);


  const ChangePasswordSchema = z
    .object({
      oldPassword: z.string().nonempty('Old Password is required'),
      newPassword: z
        .string()
        .min(8, 'Password should be at least 8 characters')
        .nonempty('New Password is required'),
      confirmPassword: z
        .string()
        .nonempty('Confirm Password is required'),
    })
    .superRefine((data, ctx) => {
      if (data.confirmPassword !== data.newPassword) {
        ctx.addIssue({
          path: ['confirmPassword'],
          message: 'Passwords must match',
        });
      }
    });


  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      emailId,
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    resolver: zodResolver(ChangePasswordSchema),
  });

  const onSubmit = async (data) => {
    try {

      const payload = {
        ...data,
        emailId: emailId
      }
      const updateResponse = await updatePassword(payload, setShowAlert, setAlertMessage, showHomeAlert, homeAlertMessage);
      if (updateResponse) {
        hidePassUpdate();
      }
    } catch (error) {
      setShowAlert(true);
      setAlertMessage('Failed to update password.');
    }
  };

  const togglePasswordVisibility = (setter) => {
    setter((show) => !show);
  };

  return (
    <>
      <form autoComplete="off" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <AlertBanner showAlert={showAlert} alertMessage={alertMessage} severity="error" />

          <Controller
            name="oldPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type={showPasswordOld ? 'text' : 'password'}
                label="Old Password"
                error={Boolean(errors.oldPassword)}
                helperText={errors.oldPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility(setShowPasswordOld)} edge="end">
                        <Iconify icon={showPasswordOld ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />


          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type={showPasswordNew ? 'text' : 'password'}
                label="New Password"
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility(setShowPasswordNew)} edge="end">
                        <Iconify icon={showPasswordNew ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />


          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type={showPasswordConfirm ? 'text' : 'password'}
                label="Confirm Password"
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => togglePasswordVisibility(setShowPasswordConfirm)} edge="end">
                        <Iconify icon={showPasswordConfirm ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>


        <Grid container spacing={2} mt={2} justifyContent="center">
          <Grid item md={6} xs={11}>
            <Button
              startIcon={<Iconify icon="material-symbols:cancel" />}
              size="large"
              onClick={hidePassUpdate}
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
