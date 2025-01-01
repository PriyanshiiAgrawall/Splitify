import { Box, Button, Container, Divider, Fab, Grid, Link, Stack, styled, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupDetailsService, getGroupExpenseService } from '../../../services/groupService';
import AlertBanner from '../../AlertBanner';
import Iconify from '../../Iconify';
import Loading from '../../Loading.jsx';
import useResponsive from '../../theme/hooks/useResponsive';
import { convertToCurrency, currencyFind, categoryIcon } from '../../../utils/helper';
import ExpenseCard from '../../expense/ExpenseCard.jsx';
import GroupCategoryGraph from './GroupCategoryGraph';
import GroupMonthlyGraph from './groupMonthlyGraph';
import { Link as RouterLink } from 'react-router-dom';
import dataConfig from '../../../config.json';
import { GroupSettlements } from '../settlement';

const profile = JSON.parse(localStorage.getItem('profile'));
const emailId = profile?.user.emailId;
let showCount = 10;

export default function ViewGroup() {
    const { groupId } = useParams();
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState({});
    const [groupExpense, setGroupExpense] = useState([]);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertExpense, setAlertExpense] = useState(false);
    const [alertExpenseMessage, setAlertExpenseMessage] = useState('');
    const [showAllExp, setShowAllExp] = useState(false);
    const [expFocus, setExpFocus] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [viewSettlement, setViewSettlement] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0)

    const mdUp = useResponsive('up', 'md');

    const toggleAllExp = () => {
        const remainingExpenses = groupExpense.slice(expenses.length, expenses.length + showCount);
        if (remainingExpenses.length > 0) {
            setExpenses((prevExpenses) => [...prevExpenses, ...remainingExpenses]);
        }
        // Hide button if there are no more expenses to load
        if (expenses.length + remainingExpenses.length >= groupExpense.length) {
            setShowAllExp(true);
        }
    };


    const toggleExpView = () => {
        setViewSettlement(0);
    };

    const toggleSettleView = () => {
        setViewSettlement(1);
    };

    const toggleMySettleView = () => {
        setViewSettlement(2);
    };

    const findUserSplit = (splits) => {
        const userSplit = splits?.find((split) => split?.member?.emailId === emailId);
        return userSplit?.amount || 0;
    };
    const findIfUserNeedsToPay = (splits) => {
        const userSplit = splits?.find((split) => {
            return split?.member?.emailId === emailId;
        })
        //user needs to pay
        if (userSplit?.amount < 0) {
            return true;

        }
        return false;
    }

    useEffect(() => {
        const getGroupDetails = async () => {
            setLoading(true);
            const groupIdJson = { id: groupId };
            const response_group = await getGroupDetailsService(groupIdJson, setAlert, setAlertMessage);
            const response_expense = await getGroupExpenseService(groupIdJson, setAlertExpense, setAlertExpenseMessage);

            response_group && setGroup(response_group?.data?.group);
            response_expense && setGroupExpense(response_expense?.data?.expenses);
            response_expense?.data?.expenses && setExpenses(response_expense?.data?.expenses?.slice(0, 5));
            if (response_expense?.data?.expenses?.length <= 5 || !response_expense) setShowAllExp(true);
            setTotalAmount(response_expense?.data?.totalAmount)

            setLoading(false);
        };

        getGroupDetails();
    }, [groupId]);

    const CategoryStyle = styled('span')(() => ({
        top: 22,
        left: -57,
        zIndex: 10,
        width: 35,
        height: 32,
        borderRadius: 50,
        position: 'relative',
    }));

    const LabelIconStyle = styled('div')(() => ({
        borderRadius: 60,
        width: 60,
        height: 60,
    }));

    return (
        <Container>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <Box
                        sx={{
                            bgcolor: (theme) => theme.palette['info'].lighter,
                            borderRadius: 2,
                            p: 2,
                            color: (theme) => theme.palette['primary'].darker,
                            pb: 3,
                        }}
                    >
                        <AlertBanner showAlert={alert} alertMessage={alertMessage} severity="error" />
                        <Link component={RouterLink} to={dataConfig.EDIT_GROUP_URL + group?._id}>
                            <Iconify icon="akar-icons:edit" sx={{ float: 'right', fontSize: 18 }} />
                        </Link>
                        <Typography variant="h4" pb={1}>
                            {group?.groupName}
                        </Typography>
                        <Typography variant="subtitle2">{group?.groupDescription}</Typography>
                        <Typography mt={1} variant="body2" sx={{ color: 'text.secondary' }}>
                            Created by &nbsp;
                            <Box component={'span'} sx={{ color: (theme) => theme.palette['primary'].darker }}>
                                {group?.groupOwner?.firstName} {group?.groupOwner?.lastName}
                            </Box>
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1} spacing={2}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        bgcolor: (theme) => theme.palette['warning'].lighter,
                                        p: 1,
                                        borderRadius: 1,
                                        color: (theme) => theme.palette['warning'].darker,
                                    }}
                                >
                                    Category : &nbsp; {group?.groupCategory}

                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ ml: 2, display: findIfUserNeedsToPay(group?.split) ? 'inline-flex' : 'none' }}
                                    component={RouterLink}
                                    to={dataConfig.SETTLEMENT_ROUTER_URL.replace(':groupId', groupId)}
                                >
                                    Settle Up
                                </Button>
                            </Stack>
                            <Fab
                                component={RouterLink}
                                to={dataConfig.ADD_EXPENSE_URL + group?._id}
                                color="primary"
                                aria-label="add"
                                variant="extended"
                                sx={{
                                    textDecoration: 'none',
                                    ...(!mdUp && {
                                        margin: 0,
                                        top: 'auto',
                                        right: 20,
                                        bottom: 20,
                                        left: 'auto',
                                        position: 'fixed',
                                    }),
                                }}
                            >
                                <Iconify
                                    icon="eva:file-add-fill"
                                    sx={{
                                        height: 22,
                                        ...(mdUp && {
                                            mr: 1,
                                            width: 22,
                                        }),
                                        ...(!mdUp && {
                                            width: '100%',
                                        }),
                                    }}
                                />
                                {mdUp && <>Add Expense</>}
                            </Fab>
                        </Stack>
                    </Box>

                    {/* Group Financial Details */}
                    <Grid container spacing={3} mt={2}>
                        <Grid item xs={12} md={4}>
                            <Stack
                                spacing={2}
                                direction="row"
                                sx={{
                                    bgcolor: (theme) => theme.palette['primary'].lighter,
                                    borderRadius: 2,
                                    p: 3,
                                }}
                            >
                                <LabelIconStyle sx={{ bgcolor: (theme) => theme.palette['primary'].dark, py: '18px' }}>
                                    <Iconify icon=":nimbus:invoice" sx={{ width: '100%', height: '100%', color: 'white' }} />
                                </LabelIconStyle>
                                <Box>
                                    <Typography variant="h6" sx={{ color: (theme) => theme.palette['primary'].dark }}>
                                        Total {group.groupName} expense
                                    </Typography>

                                    <Typography variant="h5" sx={{ color: (theme) => theme.palette['primary'].darker }}>
                                        {currencyFind(group?.groupCurrency)}{' '}
                                        {totalAmount ? convertToCurrency(totalAmount) : 0}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack
                                spacing={2}
                                direction="row"
                                sx={{
                                    bgcolor: (theme) => theme.palette['success'].lighter,
                                    borderRadius: 2,
                                    p: 3,
                                }}
                            >
                                <LabelIconStyle sx={{ bgcolor: (theme) => theme.palette['success'].dark, py: '18px' }}>
                                    <Iconify icon="mdi:cash-plus" sx={{ width: '100%', height: '100%', color: 'white' }} />
                                </LabelIconStyle>
                                <Box>
                                    <Typography variant="h6" sx={{ color: (theme) => theme.palette['success'].dark }}>
                                        You are owed <br />
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: (theme) => theme.palette['success'].darker }}>
                                        {currencyFind(group?.groupCurrency)}{' '}
                                        {findUserSplit(group?.split) > 0
                                            ? convertToCurrency(findUserSplit(group?.split))
                                            : 0}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack
                                spacing={2}
                                direction="row"
                                sx={{
                                    bgcolor: (theme) => theme.palette['error'].lighter,
                                    borderRadius: 2,
                                    p: 3,
                                }}
                            >
                                <LabelIconStyle sx={{ bgcolor: (theme) => theme.palette['error'].dark, py: '18px' }}>
                                    <Iconify icon="mdi:cash-minus" sx={{ width: '100%', height: '100%', color: 'white' }} />
                                </LabelIconStyle>
                                <Box>
                                    <Typography variant="h6" sx={{ color: (theme) => theme.palette['error'].dark }}>
                                        You owe <br />
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: (theme) => theme.palette['error'].darker }}>
                                        {currencyFind(group?.groupCurrency)}{' '}
                                        {findUserSplit(group?.split) < 0
                                            ? convertToCurrency(Math.abs(findUserSplit(group?.split)))
                                            : 0}
                                    </Typography>
                                </Box>
                            </Stack>

                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: { xs: 500, md: 500 },
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    p: 2,
                                    boxShadow: 1,
                                }}
                            >
                                <GroupCategoryGraph currencyType={group?.groupCurrency} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: { xs: 300, md: 500 },
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    p: 2,
                                    boxShadow: 1,
                                }}
                            >
                                <GroupMonthlyGraph />
                            </Box>
                        </Grid>
                        <Grid item xs={15}>
                            <Typography variant="h5" gutterBottom>
                                Group Expenses
                            </Typography>
                            {expenses.map((expense) => (
                                <ExpenseCard
                                    key={expense._id}
                                    expenseId={expense._id}
                                    expenseName={expense.expenseName}
                                    expenseAmount={expense.expenseAmount}
                                    expensePerMember={expense.expensePerMember}
                                    expensePaidBy={expense.expensePaidBy.firstName}
                                    expenseOwner={expense.expenseCreatedBy.firstName}
                                    expenseDate={expense.expenseDate}
                                    currencyType={group?.groupCurrency}
                                />
                            ))}
                            {groupExpense.length > expenses.length && (
                                <Button
                                    variant="outlined"
                                    onClick={toggleAllExp}
                                    sx={{ mt: 2, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
                                >
                                    Load More Expenses
                                </Button>
                            )}
                        </Grid>

                    </Grid>

                </>
            )}

        </Container>
    );
}

