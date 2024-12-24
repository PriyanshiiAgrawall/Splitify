import { Box, Button, Container, Divider, Fab, Grid, Link, Stack, styled, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupDetailsService, getGroupExpenseService } from '../../../services/groupService';
import AlertBanner from '../../AlertBanner';
import Iconify from '../../Iconify';
import Loading from '../../loading';
import useResponsive from '../../theme/hooks/useResponsive';
import { convertToCurrency, currencyFind, categoryIcon } from '../../../utils/helper';
import ExpenseCard from '../../expense/expenseCard';
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
        setExpenses(groupExpense?.expense?.slice(0, showCount));
        if (showCount >= groupExpense?.expense?.length) setShowAllExp(true);
        setExpFocus(true);
        showCount += 5;
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
            console.log("here")
            console.log(group)
            console.log(groupExpense)
            console.log(expenses)
            setLoading(false);
        };

        getGroupDetails();
    }, []);

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
                    </Grid>
                </>
            )}
        </Container>
    );
}
