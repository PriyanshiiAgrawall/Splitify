import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExpDetailsService } from "../../services/expenseServices";
import useResponsive from '../theme/hooks/useResponsive';
import { convertToCurrency, currencyFind } from '../../utils/helper';
import Loading from "../loading";
import AlertBanner from '../AlertBanner';
import { Link as RouterLink } from 'react-router-dom';
import dataConfig from '../../config.json';

export const ViewExpense = () => {
    const navigate = useNavigate();
    const params = useParams();
    const mdUp = useResponsive('up', 'md');
    const expenseId = params.expenseId;
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [expenseDetails, setExpenseDetails] = useState();
    const [expenseDate, setExpenseDate] = useState();

    useEffect(() => {
        const getExpenseDetails = async () => {
            setLoading(true);
            const userPayloadHasExpenseId = {
                id: expenseId
            };

            const response_exp = await getExpDetailsService(userPayloadHasExpenseId, setAlert, setAlertMessage);

            setExpenseDetails(response_exp?.data?.expense);
            const date = new Date(response_exp?.data?.expense?.expenseDate).toDateString();
            setExpenseDate(date);
            setLoading(false);
        };

        getExpenseDetails();
    }, [expenseId]);

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <Container
                    maxWidth='md'
                    disableGutters
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 5,
                    }}
                >
                    <AlertBanner severity='error' alertMessage={alertMessage} showAlert={alert} />
                    <Box
                        sx={{
                            bgcolor: (theme) => theme.palette.primary.lighter,
                            p: 6,
                            mb: 3,
                            width: '100%'
                        }}
                    >
                        <Typography variant='h3'>
                            {expenseDetails?.expenseName}
                        </Typography>
                        <Typography variant='body'>
                            {expenseDetails?.expenseDescription}
                        </Typography>
                    </Box>
                    <Grid container spacing={3} p={4}>

                        <Grid item md={6} xs={12}>
                            <Typography variant='h6'>
                                Category: {expenseDetails?.expenseCategory}
                            </Typography>
                        </Grid>

                        <Grid item md={6} xs={12}>
                            <Typography variant='h6'>
                                Date: {expenseDate}
                            </Typography>
                        </Grid>

                        <Grid item md={6} xs={12}>
                            <Typography variant='h6'>
                                Amount: {currencyFind(expenseDetails?.expenseCurrency) + " " + convertToCurrency(expenseDetails?.expenseAmount)}
                            </Typography>
                        </Grid>

                        <Grid item md={6} xs={12}>
                            <Typography variant='h6'>
                                Payment Method: {expenseDetails?.expenseType}
                            </Typography>
                        </Grid>

                        <Grid item md={6} xs={12}>
                            <Typography variant='h6'>
                                Expense Created By: {`${expenseDetails?.expenseCreatedBy?.firstName} ${expenseDetails?.expenseCreatedBy?.lastName}`}
                            </Typography>
                        </Grid>

                        <Grid item md={6} xs={12}>
                            <Typography variant='h6'>
                                Expense Paid By: {`${expenseDetails?.expensePaidBy?.firstName} ${expenseDetails?.expensePaidBy?.lastName}`}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant='h6' color={(theme) => theme.palette.error.main}>
                                Amount per person: {currencyFind(expenseDetails?.expenseCurrency) + " " + convertToCurrency(expenseDetails?.expensePerMember)}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant='h6'>
                                Members:
                            </Typography>
                            {expenseDetails?.expenseMembers.map((member) => (
                                <Typography variant='body2' key={member._id}>
                                    {`${member.firstName} ${member.lastName}`}
                                    &nbsp;
                                </Typography>
                            ))}
                        </Grid>

                        {mdUp && <Grid item xs={0} md={6} />}
                        <Grid item xs={6} md={3}>
                            <Button fullWidth size="large" variant="outlined" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                component={RouterLink}
                                to={dataConfig.EDIT_EXPENSE_URL + expenseId}
                            >
                                Edit
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            )}
        </>
    );
};
