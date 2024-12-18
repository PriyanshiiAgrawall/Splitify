import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Stack, TextField, IconButton, InputAdornment, Snackbar, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Iconify from '../Iconify';
import useResponsive from "../theme/hooks/useResponsive"
import { register as registerService } from '../../services/authentication';

export default function RegisterForm() {
    const smUp = useResponsive('up', 'sm');
    const [showPassword, setShowPassword] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm();

    // Password visibility toggle
    const handleShowPassword = () => setShowPassword((prev) => !prev);

    // On Submit handler
    const onSubmit = async (data) => {
        try {
            await registerService(data, setShowAlert, setAlertMessage);
            reset(); // Clear the form on success iit is provided by react hook form
        } catch (error) {
            setAlertMessage('Registration failed');
            setShowAlert(true);
        }
    };

    return (
        <>
            {!smUp && (
                <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
                    <Alert severity="error">{alertMessage}</Alert>
                </Snackbar>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                    {smUp && showAlert && (
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {alertMessage}
                        </Alert>
                    )}

                    {/* First and Last Name */}
                    <Stack spacing={3} direction="row">
                        <TextField
                            fullWidth
                            placeholder="First Name"

                            {...register('firstName', { required: 'First Name is required' })}
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                        />
                        <TextField
                            label="Last Name"
                            placeholder="Last Name"

                            fullWidth
                            {...register('lastName')}
                        />
                    </Stack>

                    {/* Email */}
                    <TextField

                        fullWidth
                        type="email"
                        placeholder="Email Address"

                        {...register('emailId', {
                            required: 'Email is required',
                            pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email format' },
                        })}
                        error={!!errors.emailId}
                        helperText={errors.emailId?.message}
                    />

                    {/* Password */}
                    <TextField

                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"

                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleShowPassword} edge="end">
                                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Submit Button */}
                    <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                        Register
                    </LoadingButton>
                </Stack>
            </form>
        </>
    );
}


