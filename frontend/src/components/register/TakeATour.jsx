import React from 'react';
import { Button, Stack } from '@mui/material';
import Iconify from '../Iconify';
import { login } from '../../services/authentication';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
export default function TakeATour() {
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    const handleTakeATour = async () => {
        try {
            const data = {
                emailId: 'pri@gmail.com',
                password: '123456789'
            }
            const response = await login(data, setAlertMessage, setShowAlert);

        } catch (error) {
            console.error('An error occurred during login:', error);
        }
    };

    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: '10vh', backgroundColor: '#f9f9f9' }}
        >
            <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mdi:account-circle-outline" />}
                onClick={handleTakeATour}
                sx={{ padding: '10px 20px', fontSize: '16px' }}
            >
                Take a Tour with Dummy Data
            </Button>
        </Stack>
    );
}
