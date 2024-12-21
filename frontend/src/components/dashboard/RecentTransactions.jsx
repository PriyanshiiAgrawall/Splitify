import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { getRecentUserExpService } from '../../services/expenseServices';
import AlertBanner from '../AlertBanner';
import ExpenseCard from '../expense/expenseCard';
import Loading from '../loading';

export const RecentTransactions = () => {
    const [loading, setLoading] = useState(true)
    const [alert, setAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState()
    const [recentExp, setRecentExp] = useState([])
    const profile = JSON.parse(localStorage.getItem('profile'))

    useEffect(() => {
        const fetchRecentExpenses = async () => {
            setLoading(true);
            console.log(profile)
            try {
                console.log("reached1")
                const userPayloadHasUserId = {

                    userId: profile.user._id,
                };
                console.log("reached2")
                // Fetch data from service
                const response = await getRecentUserExpService(userPayloadHasUserId, setAlert, setAlertMessage);
                console.log("reached3")
                console.log(response)
                if (response?.data?.expenses) {
                    console.log(response.data.expenses)
                    setRecentExp(response.data.expenses);
                } else {
                    throw new Error('Failed to fetch recent expenses');
                }
            } catch (error) {
                setAlert({
                    show: true,
                    message: error.message || 'Something went wrong while fetching expenses',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRecentExpenses();
    }, []);

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <Box
                    sx={{
                        boxShadow: 5,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                    }}
                >
                    {/* Alert Banner */}
                    <AlertBanner
                        showAlert={alert.show}
                        alertMessage={alert.message}
                        severity="error"
                    />

                    {/* Title */}
                    <Typography variant="h6" p={2}>
                        Your Recent Transactions
                    </Typography>

                    {/* Expense Cards */}
                    {recentExp.map((expense) => (
                        <ExpenseCard


                            key={expense._id}
                            expenseId={expense._id}
                            expenseName={expense.expenseName}
                            expenseAmount={expense.expenseAmount}
                            expensePerMember={expense.expensePerMember}
                            expensePaidBy={expense.expensePaidBy.firstName}
                            expenseOwner={expense.expenseCreatedBy.firstName}
                            expenseDate={expense.expenseDate}
                            currencyType={expense.expenseCurrency}
                        />
                    ))}
                </Box>
            )}
        </>
    );
};
