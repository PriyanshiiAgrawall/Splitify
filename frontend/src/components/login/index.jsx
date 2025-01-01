import { Link as RouterLink } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import { Card, Link, Container, Typography, Stack, Box } from '@mui/material';
import Cookies from 'js-cookie';


import useResponsive from '../theme/hooks/useResponsive';
import LoginForm from './LoginForm';
import Copyright from '../Copyright';
import splitify from "../../assets/splitify.png"
import configData from '../../config.json'
import TakeATour from '../register/TakeATour';

const RootStyle = styled('div')(({
    theme
}) => ({
    [theme.breakpoints.up('md')]: {
        display: 'flex',
    },
}));

const HeaderStyle = styled('header')(({
    theme
}) => ({
    top: 0,
    zIndex: 9,
    lineHeight: 0,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    padding: theme.spacing(3),
    justifyContent: 'space-between',
    [theme.breakpoints.up('md')]: {
        alignItems: 'flex-start',
        padding: theme.spacing(7, 5, 0, 7),
    },
}));

const SectionStyle = styled(Card)(({ theme }) => ({
    width: '100%',
    maxWidth: 464,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: theme.spacing(2, 0, 2, 2),
}));

const ContentStyle = styled('div')(({ theme }) => ({
    maxWidth: 480,
    margin: 'auto',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    padding: theme.spacing(12, 0),
}));

export default function Login() {
    // smUp will be true if the screen size is >= 600px (small screens and up)
    //mdUp will be true if the screen size is >= 900px (medium screens and up)
    const smUp = useResponsive('up', 'sm');
    const mdUp = useResponsive('up', 'md');
    //Function to check if the user is already logged in - check localStorage 
    //If you save a JavaScript object, you must stringify it before storing, and parse it back into an object when retrieving.
    const user = JSON.parse(localStorage.getItem('profile'))
    //If user logged in the page is auto directed to dashboard
    if (user) {
        const cookieToken = Cookies.get('token'); // Replace 'token' with the actual cookie name
        console.log("User Token:", cookieToken);
        if (user.accessToken && cookieToken) {

            window.location.href = configData.DASHBOARD_URL;
        } else {
            console.error("No token found in cookies or user.accessToken missing.");
        }
    }
    return (
        <>
            <RootStyle>
                <HeaderStyle>
                    <Box />
                    {smUp && (
                        <Typography variant="body2" sx={{ mt: { md: -2 } }}>
                            Don’t have an account? {''}
                            <Link variant="subtitle2" component={RouterLink} to="/register">
                                Get started
                            </Link>
                        </Typography>
                    )}
                </HeaderStyle>
                {mdUp && (
                    <SectionStyle>
                        <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
                            Hi, Welcome Back
                        </Typography>
                        <img src={splitify} alt="login" />
                    </SectionStyle>
                )}
                <Container maxWidth="sm">
                    <ContentStyle>
                        <Typography variant="h4" gutterBottom>
                            Sign in to Splitify!
                        </Typography>

                        <Typography sx={{ color: 'text.secondary', mb: 5 }}>Enter your details below.</Typography>



                        <LoginForm />
                        <TakeATour />
                        {!smUp && (
                            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                                Don’t have an account?{' '}
                                <Link variant="subtitle2" component={RouterLink} to="/register">
                                    Get started
                                </Link>
                            </Typography>
                        )}
                        <Stack spacing={3} sx={{ mt: 5 }}>
                            <Copyright />
                        </Stack>
                    </ContentStyle>
                </Container>
            </RootStyle>

        </>
    )
}