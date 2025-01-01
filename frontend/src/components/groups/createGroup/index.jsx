import React, { useEffect, useState } from 'react';
import {
    Box,
    Chip,
    Container,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useResponsive from '../../theme/hooks/useResponsive';
import { getEmailList } from '../../../api';
import Loading from '../../Loading.jsx';
import { createGroupService } from '../../../services/groupService';
import AlertBanner from '../../AlertBanner';
import configData from '../../../config.json';

export default function Creategroup() {
    const mdUp = useResponsive('up', 'md');
    const profile = JSON.parse(localStorage.getItem('profile'));
    const currentUser = profile?.user?.emailId;

    const [loading, setLoading] = useState(false);
    const [emailList, setEmailList] = useState([]);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // Zod schema for validation
    const schema = z.object({
        groupName: z.string().nonempty('Group name is required'),
        groupDescription: z.string().optional(),
        groupCurrency: z.string().nonempty('Currency Type is required'),
        groupCategory: z.string().optional(),
        groupMembers: z.array(z.string()).min(1, 'At least one group member is required'),
    });

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            groupName: '',
            groupDescription: '',
            groupCurrency: '',
            groupCategory: 'Others',
            groupMembers: [currentUser], // Current user is set as the default member
        },
    });

    // Fetch email list
    useEffect(() => {
        const fetchEmails = async () => {
            setLoading(true);
            try {
                const response = await getEmailList();
                const list = response.data.users;
                if (list.indexOf(currentUser) > -1) {
                    list.splice(list.indexOf(currentUser), 1); // Remove current user from the list
                }
                setEmailList(list);
            } catch (error) {
                setAlert(true);
                setAlertMessage('Failed to fetch email list.');
            } finally {
                setLoading(false);
            }
        };

        fetchEmails();
    }, [currentUser]);

    // Submit handler
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await createGroupService(data, setAlert, setAlertMessage);
            window.location = configData.VIEW_GROUP_URL + response.data.groupId;
        } catch (error) {
            setAlert(true);
            setAlertMessage('Failed to create group.');
        } finally {
            setLoading(false);
        }
    };

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    return (
        <Container>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <Typography variant="h4" pb={2} mb={3}>
                        Create New Group
                    </Typography>
                    <AlertBanner showAlert={alert} alertMessage={alertMessage} severity="error" />
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3} sx={{ maxWidth: 800 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Group Name"
                                    {...register('groupName')}
                                    error={!!errors.groupName}
                                    helperText={errors.groupName?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Group Description"
                                    {...register('groupDescription')}
                                    error={!!errors.groupDescription}
                                    helperText={errors.groupDescription?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.groupMembers}>
                                    <InputLabel id="group-members-label">Group Members</InputLabel>
                                    <Controller
                                        name="groupMembers"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                labelId="group-members-label"
                                                id="group-members"
                                                multiple
                                                {...field}
                                                input={<OutlinedInput label="Group Members" />}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => (
                                                            <Chip key={value} label={value} />
                                                        ))}
                                                    </Box>
                                                )}
                                                MenuProps={MenuProps}
                                            >
                                                {emailList.map((email) => (
                                                    <MenuItem key={email} value={email}>
                                                        {email}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        )}
                                    />
                                    <FormHelperText>{errors.groupMembers?.message}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth error={!!errors.groupCurrency}>
                                    <InputLabel id="group-currency-label">Currency</InputLabel>
                                    <Select
                                        labelId="group-currency-label"
                                        id="group-currency"
                                        {...register('groupCurrency')}
                                        label="Currency"
                                    >
                                        <MenuItem value="INR">₹ INR</MenuItem>
                                        <MenuItem value="USD">$ USD</MenuItem>
                                        <MenuItem value="EUR">€ EUR</MenuItem>
                                    </Select>
                                    <FormHelperText>{errors.groupCurrency?.message}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth error={!!errors.groupCategory}>
                                    <InputLabel id="group-category-label">Category</InputLabel>
                                    <Select
                                        labelId="group-category-label"
                                        id="group-category"
                                        {...register('groupCategory')}
                                        label="Category"
                                    >
                                        <MenuItem value="Home">Home</MenuItem>
                                        <MenuItem value="Trip">Trip</MenuItem>
                                        <MenuItem value="Office">Office</MenuItem>
                                        <MenuItem value="Sports">Sports</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                    </Select>
                                    <FormHelperText>{errors.groupCategory?.message}</FormHelperText>
                                </FormControl>
                            </Grid>
                            {mdUp && <Grid item xs={0} md={9} />}
                            <Grid item xs={6} md={3}>
                                <LoadingButton
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                >
                                    Create Group
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </form>
                </>
            )}
        </Container>
    );
}
