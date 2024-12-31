//react hook form minimises multiple rerenders , prevents multiple submissions , less code for validation ,
import { useForm } from 'react-hook-form';
import { Stack, TextField, IconButton, InputAdornment, Snackbar, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import useResponsive from "../theme/hooks/useResponsive"
import Iconify from '../Iconify';
import { useState } from 'react';
import { login } from '../../services/authentication';


export default function LoginForm() {
    {/*generates media query*/ }
    const smUp = useResponsive('up', 'sm');
    const [showPassword, setShowPassword] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    async function onSubmit(data) {

        //call to login service 
        await login(data, setAlertMessage, setShowAlert);
    }

    //onSubmit function ko data provide handleSbmit karega 
    return (
        <>
            {/* Snackbar is used for Alert errors */}
            <Snackbar open={showAlert} autoHideDuration={6000} onClose={() => setShowAlert(false)}>
                <Alert severity="error" sx={{ width: '100%' }}>
                    {alertMessage}
                </Alert>
            </Snackbar>

            {/*Login Form     The noValidate attribute tells the browser not to perform its built-in form validation (e.g., email format or required fields).     If errors.email exists, !! converts it to true*/}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing={3}>
                    {/* Email Field */}
                    <TextField

                        type="email"
                        placeholder="Email Address"
                        error={!!errors.emailId}
                        helperText={errors.emailId?.message}
                        {...register("emailId", {
                            required: "Email field can't be empty",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Inputted email is not valid",
                            },
                        })}
                    />

                    {/* Password Field */}
                    <TextField

                        type={showPassword ? 'text' : 'password'}

                        placeholder="Password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        {...register("password", {
                            required: "Password field can't be empty",
                            minLength: {
                                value: 8,
                                message: "Password must be at least 8 characters",
                            },
                        })}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Submit Button */}
                    <LoadingButton

                        size="large"
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                    >
                        Login
                    </LoadingButton>
                </Stack>
            </form>

        </>
    )
}


{/* <input className={errors.email ? 'input-error' : ''
                    } placeholder='Email Address'
                        {...register("email", {
                            required: { value: true, message: 'email field cant be empty' }, pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/


                                , message: 'Inputted email is not valid'
                            }
                        })} />
                </div>
                <div>
                    <input
                        className={errors.password ? 'input-error' : ''
                        } placeholder='Password' {...register("password",
                            { required: { value: true, message: 'password field cant be empty' }, minLength: { value: 8, message: 'Inputted password is too small it should be atleast 8 characters' } })} />
                    {errors.email
                        && <p className='error-msg'>{errors.email.message}</p>}
                    {errors.password
                        && <p className='error-msg'>{errors.password.message}</p>}
                </div>
                <div>
                    <input type='submit' disabled={isSubmitting} value={isSubmitting ? "Submitting" : "Submit"} /> */}