import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGroupSettleService } from '../../../services/groupService';
import useResponsive from '../../theme/hooks/useResponsive';
import AlertBanner from '../../AlertBanner';
import Iconify from '../../Iconify';
import Loading from '../../Loading.jsx';
import SettlementCard from './settlementCard';
import UserBalanceChart from './userBalanceChart';

export const GroupSettlementsCall = () => {
    const params = useParams();
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [groupCurrency, setGroupCurrency] = useState();

    useEffect(() => {
        const fetchGroupCurrency = async () => {
            try {
                setLoading(true);
                const groupIdJson = { id: params.groupId };
                const response = await getGroupSettleService(groupIdJson, setAlert, setAlertMessage);
                setGroupCurrency(response?.data?.currency);
            } catch (error) {
                setAlert(true);
                setAlertMessage('Failed to fetch group details.');
            } finally {
                setLoading(false);
            }
        };
        fetchGroupCurrency();
    }, [params.groupId]);

    return <GroupSettlements currencyType={groupCurrency} />;
};

export const GroupSettlements = ({ currencyType }) => {
    const params = useParams();
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [groupSettlement, setGroupSettlement] = useState([]);
    const [noSettle, setNoSettle] = useState(true);

    const mdUp = useResponsive('up', 'md');

    useEffect(() => {
        const fetchGroupSettlement = async () => {
            try {
                setLoading(true);
                const groupIdJson = { id: params.groupId };
                const response = await getGroupSettleService(groupIdJson, setAlert, setAlertMessage);

                const settlements = response?.data?.data || [];
                setGroupSettlement(settlements);
                setNoSettle(settlements.length === 0);
            } catch (error) {
                setAlert(true);
                setAlertMessage('Failed to fetch settlement data.');
            } finally {
                setLoading(false);
            }
        };
        fetchGroupSettlement();
    }, [params.groupId]);

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <Box sx={{ pb: 3 }}>
                    <AlertBanner showAlert={alert} alertMessage={alertMessage} severity="error" />
                    <Grid container spacing={2}>
                        {groupSettlement.map((settle, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <SettlementCard
                                    settleFrom={settle.settleFrom}
                                    settleTo={settle.settleTo}
                                    amount={settle.amount}
                                    currencyType={currencyType}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {noSettle && (
                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            justifyContent="center"
                            style={{
                                display: 'flex',
                                minHeight: '200px',
                                textAlign: 'center',
                            }}
                        >
                            <Iconify
                                icon="icon-park-twotone:doc-success"
                                sx={{ color: (theme) => theme.palette.success.dark, fontSize: 100 }}
                            />
                            <Typography fontSize={18} textAlign="center" my={1}>
                                No Settlement Required!
                            </Typography>
                        </Grid>
                    )}

                    {!noSettle && <UserBalanceChart />}
                </Box>
            )}
        </>
    );
};
