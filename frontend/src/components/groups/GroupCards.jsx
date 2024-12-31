// @mui
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Card, CardContent, Typography, Box, AvatarGroup, Stack, Grid, Button, Modal } from '@mui/material';
import { convertToCurrency, currencyFind, categoryIcon } from '../../utils/helper';
import { groupDeleteService } from '../../services/groupService';

import Iconify from '../Iconify';
import configData from '../../config.json'
import Avatar from 'react-avatar';
import { useState } from 'react';



const modelStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
};



const CategoryStyle = styled('div')(({ theme }) => ({
    zIndex: 9,
    width: 35,
    height: 32,
    position: 'absolute',
    left: 22,
    top: 130,
    background: "red",
    borderRadius: 50
}));


GroupCards.propTypes = {
    color: PropTypes.string,
    icon: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    groupMembers: PropTypes.array,
    groupId: PropTypes.string,
    share: PropTypes.number,
    currencyType: PropTypes.string,
    groupCategory: PropTypes.string,
    isGroupActive: PropTypes.bool,
    sx: PropTypes.object,
};

export default function GroupCards({ groupId, title, description, groupMembers, share, currencyType, groupCategory, isGroupActive, icon, color = 'primary', sx, ...other }) {
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const handleDeleteGroup = async (event) => {

        try {
            await groupDeleteService({ groupId: groupId }, setShowAlert, setAlertMessage);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting group')
        }
    };
    const deleteConfirmOpen = (event) => {
        event.stopPropagation()
        event.preventDefault()
        setDeleteConfirm(true);

    }
    const deleteConfirmClose = () => setDeleteConfirm(false);
    return (
        <Card
            sx={{
                p: 0,
                boxShadow: 5,
                borderRadius: 2,
                position: 'relative',
                ...sx,
            }}
            {...other}
            onClick={(e) => {

                e.stopPropagation();
            }}
        >

            <Box
                component="span"
                sx={{
                    width: 80,
                    height: 36,
                    display: 'inline-block',
                    bgcolor: 'currentColor',
                    mask: `url(/static/icons/shape-avatar.svg) no-repeat center / contain`,
                    WebkitMask: `url(/static/icons/shape-avatar.svg) no-repeat center / contain`,
                    zIndex: 9,
                    top: 125,
                    position: 'absolute',
                    color: 'background.paper'
                }}
            />
            <CategoryStyle
                sx={{
                    bgcolor: (theme) => theme.palette[color].lighter,
                    py: '6px',
                    px: '9px'
                }}
            >
                <Iconify icon={categoryIcon(groupCategory)} color={(theme) => theme.palette[color].darker}
                />
            </CategoryStyle>

            <Box pt={6} px={2} pb={3}
                sx={{
                    bgcolor: (theme) => theme.palette[color].lighter,
                    color: (theme) => theme.palette[color].darker
                }}
            >
                <Typography noWrap variant="h3" fontSize={30} sx={{ opacity: 0.72 }}>
                    {title}
                </Typography>
                <Typography noWrap variant="subtitle2" fontSize={14} color={'text.secondary'}>
                    {description} &nbsp;</Typography>
            </Box>
            <CardContent
                sx={{
                    pt: 3,
                    px: 1
                }}

            >
                <Stack direction="row" spacing={2} p={1} mt={1}>
                    <Typography sx={{
                        bgcolor: isGroupActive ? (theme) => theme.palette['error'].lighter : (theme) => theme.palette['success'].lighter,
                        p: 1,
                        borderRadius: 1,
                        color: isGroupActive ? (theme) => theme.palette['error'].darker : (theme) => theme.palette['success'].darker
                    }}>
                        {isGroupActive ? (<b>Not Settled</b>) : (<b>Settled</b>)}
                    </Typography>

                    <Typography sx={{
                        bgcolor: share < 0 ? (theme) => theme.palette['error'].lighter : (theme) => theme.palette['success'].lighter,
                        p: 1,
                        borderRadius: 1,
                        color: share < 0 ? (theme) => theme.palette['error'].darker : (theme) => theme.palette['success'].darker
                    }}>
                        <b> {share < 0 ? <>You owe</> : <>You are owed</>} : &nbsp;
                            {currencyFind(currencyType)} {convertToCurrency(Math.abs(Math.floor(share)))}</b>
                    </Typography>
                </Stack>
                <Grid container direction="row" spacing={1} p={1}>
                    <Grid item md={6} xs={12}>
                        <Stack direction="row" width={'100%'}>
                            <Typography justifyContent={'center'} py={1} mr={1}>
                                Category {" "}
                            </Typography>
                            <Box sx={{
                                bgcolor: (theme) => theme.palette['warning'].lighter,
                                p: 1,
                                borderRadius: 1,
                                color: (theme) => theme.palette['warning'].darker,
                            }}>
                                {groupCategory}
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item md={6} xs={12}>
                        <AvatarGroup max={3} sx={{ width: '100%' }}>
                            {groupMembers.map(member => (
                                <Avatar
                                    key={member.firstName}
                                    name={member.firstName}
                                    size="40"
                                    round={true}
                                    color="random"
                                    fgColor="#fff"
                                />
                            ))}
                        </AvatarGroup>
                    </Grid>
                </Grid>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                    }}
                >
                    <Button
                        startIcon={<Iconify icon="fluent:delete-dismiss-24-filled" />}
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={(event) => {

                            event.stopPropagation()
                            event.preventDefault()
                            deleteConfirmOpen(event);
                        }}
                        sx={{
                            width: 40,
                            height: 40,
                            minWidth: 0,
                            border: 0,
                        }}
                    >
                    </Button>
                </Box>

            </CardContent>
            <Modal
                open={deleteConfirm}
                onClose={deleteConfirmClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modelStyle}>
                    <Typography id="modal-title" variant="h6" component="h2">
                        Confirm Group Deletion
                    </Typography>
                    <Typography id="modal-description" sx={{ mt: 2 }}>
                        Are you sure you want to delete this group? THIS ACTION CAN NOT BE UNDONE.
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                handleDeleteGroup();
                                deleteConfirmClose();
                            }}
                        >
                            Delete
                        </Button>
                        <Button variant="outlined" onClick={deleteConfirmClose}>
                            Cancel
                        </Button>
                    </Stack>
                </Box>
            </Modal>


        </Card >
    );
}