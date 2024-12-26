import React, { useState } from 'react';
import {
  Button,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LoadingButton } from '@mui/lab';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useResponsive from '../../theme/hooks/useResponsive';
import Loading from '../../loading';
import Iconify from '../../Iconify';
import AlertBanner from '../../AlertBanner';
import { currencyFind } from '../../../utils/helper';
import { useParams } from 'react-router-dom';
import { settlementService } from '../../../services/groupService';

const BalanceSettlement = ({ currencyType, settleTo, settleFrom, amount, handleClose, setReload }) => {
  const mdUp = useResponsive('up', 'md');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [settleSuccess, setSettleSuccess] = useState(false);
  const params = useParams();


  const schema = z.object({
    settleTo: z.string().nonempty('Settle to is required'),
    settleFrom: z.string().nonempty('Settle from is required'),
    settleAmount: z
      .number()
      .min(1, 'Minimum amount is 1')
      .max(amount, `Maximum amount is ${amount}`),
    settleDate: z.date().optional(),
  });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      settleTo: `${settleTo.firstName} ${settleTo.lastName} (${settleTo.email})`,
      settleFrom: `${settleFrom.firstName} ${settleFrom.lastName} (${settleFrom.email})`,
      settleAmount: amount,
      settleDate: new Date(),
      groupId: params.groupId,
    },
  });

  // Submit handler
  const onSubmit = async (data) => {
    setLoading(true);
    try {

      const payload = {
        ...data, groupId: params.groupId
      }
      console.log(payload)
      const response = await settlementService(payload, setAlert, setAlertMessage);
      if (response?.data?.status === 'Success') {
        setSettleSuccess(true);
        setReload(true);
      }
    } catch (error) {
      setAlert(true);
      setAlertMessage('Settlement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {settleSuccess ? (
            <Grid
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              style={{ minHeight: '200px', textAlign: 'center' }}
            >
              <Iconify
                icon="icon-park-twotone:success"
                sx={{ color: (theme) => theme.palette.success.dark, fontSize: 100 }}
              />
              <Typography variant="h4" mt={2}>
                Settlement Successful!
              </Typography>
            </Grid>
          ) : (
            <>
              <Typography variant="h6" mb={4}>
                Settle Balance
              </Typography>
              <AlertBanner showAlert={alert} alertMessage={alertMessage} severity="error" />
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Settlement To"
                      variant="outlined"
                      disabled
                      value={`${settleTo.firstName} ${settleTo.lastName} (${settleTo.email})`}
                      {...register('settleTo')}
                      error={!!errors.settleTo}
                      helperText={errors.settleTo?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Settlement From"
                      variant="outlined"
                      disabled
                      value={`${settleFrom.firstName} ${settleFrom.lastName} (${settleFrom.email})`}
                      {...register('settleFrom')}
                      error={!!errors.settleFrom}
                      helperText={errors.settleFrom?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      {mdUp ? (
                        <Controller
                          name="settleDate"
                          control={control}
                          render={({ field }) => (
                            <DesktopDatePicker
                              label="Settlement Date"
                              inputFormat="dd/MM/yyyy"
                              {...field}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error={!!errors.settleDate}
                                  helperText={errors.settleDate?.message}
                                  fullWidth
                                />
                              )}
                            />
                          )}
                        />
                      ) : (
                        <Controller
                          name="settleDate"
                          control={control}
                          render={({ field }) => (
                            <MobileDatePicker
                              label="Settlement Date"
                              inputFormat="dd/MM/yyyy"
                              {...field}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error={!!errors.settleDate}
                                  helperText={errors.settleDate?.message}
                                  fullWidth
                                />
                              )}
                            />
                          )}
                        />
                      )}
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Settlement Amount"
                      type="number"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {currencyFind(currencyType)}
                          </InputAdornment>
                        ),
                      }}
                      {...register('settleAmount')}
                      error={!!errors.settleAmount}
                      helperText={errors.settleAmount?.message}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Button fullWidth size="large" variant="outlined" onClick={handleClose}>
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <LoadingButton
                      fullWidth
                      size="large"
                      type="submit"
                      variant="contained"
                      loading={isSubmitting}
                    >
                      Settle
                    </LoadingButton>
                  </Grid>
                </Grid>
              </form>
            </>
          )}
        </>
      )}
    </>
  );
};

export default BalanceSettlement;
