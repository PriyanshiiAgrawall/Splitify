import { Button, Grid, Modal, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Iconify from "../../Iconify";
import useResponsive from "../../theme/hooks/useResponsive";
import { convertToCurrency, currencyFind } from '../../../utils/helper';
import BalanceSettlement from "./balanceSettlement";
import React, { useState } from 'react';
import AvatarReact from 'react-avatar'; // Import react-avatar

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 2,
    p: 4,
    borderRadius: 1
};
const SettlementCard = ({ settleFrom, settleTo, amount, currencyType }) => {
    const xsUp = useResponsive('up', 'sm');
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        if (reload) {
            window.location.reload();
        } else {
            setOpen(false);
        }
    };

    return (
        <Stack
            direction="row"
            spacing={1}
            justifyContent="space-evenly"
            alignItems="center"
            sx={{
                bgcolor: (theme) => theme.palette['warning'].lighter,
                p: 3,
                borderRadius: 2,
                boxShadow: 4,
            }}
        >

            <AvatarReact
                name={`${settleFrom.firstName} ${settleFrom.lastName}`}
                size="56"
                round={true}
                textSizeRatio={2}
                color="#E0E0E0" // Background color
            />

            <Stack spacing={0}>
                <Typography variant="body" noWrap sx={{ fontWeight: 600, ...(!xsUp && { fontSize: 12 }) }}>
                    {`${settleFrom.firstName} ${settleFrom.lastName}`}
                </Typography>

                <Typography variant="body" noWrap sx={{ ...(!xsUp && { fontSize: 12 }) }}>
                    to{' '}
                    <Typography variant="subtitle" sx={{ fontWeight: 600 }}>
                        {`${settleTo.firstName} ${settleTo.lastName}`}
                    </Typography>
                </Typography>

                {!xsUp && (
                    <>
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: 10,
                                mt: '3px',
                                color: (theme) => theme.palette['error'].dark,
                            }}
                        >
                            Settlement Amount
                        </Typography>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{
                                fontWeight: 900,
                                color: (theme) => theme.palette['error'].dark,
                            }}
                        >
                            {currencyFind(currencyType)} {convertToCurrency(amount)}
                        </Typography>
                    </>
                )}
            </Stack>
            {xsUp && (
                <Stack spacing={0} alignItems="center">
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: 10,
                            color: (theme) => theme.palette['error'].dark,
                        }}
                    >
                        Settlement Amount
                    </Typography>
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{
                            fontWeight: 900,
                            color: (theme) => theme.palette['error'].dark,
                        }}
                    >
                        {currencyFind(currencyType)} {convertToCurrency(amount)}
                    </Typography>
                </Stack>
            )}

            <Button onClick={handleOpen}>Settle</Button>

            <Modal open={open} onClose={handleClose}>
                <Box sx={style} width={xsUp ? '50%' : '90%'}>
                    <BalanceSettlement
                        currencyType={currencyType}
                        settleTo={settleTo}
                        settleFrom={settleFrom}
                        amount={amount}
                        handleClose={handleClose}
                        setReload={setReload}
                    />
                </Box>
            </Modal>
        </Stack>
    );
};

export default SettlementCard;
