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
    Button
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useResponsive from '../theme/hooks/useResponsive';
import { getEmailList } from '../../services/authentication';
import { getGroupDetailsService, editGroupService } from "../../services/groupService"
import Loading from '../loading';
import AlertBanner from '../AlertBanner';
import { useNavigate, useParams } from 'react-router-dom';
import configData from '../../config.json';

// Zod schema for validation
const schema = z.object({
    groupId: z.string().nonempty('Group ID is required'),
    groupName: z.string().optional(),
    groupDescription: z.string().max(100, 'Description is too long').optional(),
    groupCategory: z.string().optional(),
    groupMembers: z
        .array(z.string().nonempty('Member ID is required'))
        .min(1, 'At least one group member is required').optional(),
});

export const EditGroup = () => {
    const navigate = useNavigate();
    const { groupId } = useParams(); // Extract groupId from URL
    const mdUp = useResponsive('up', 'md');
    const profile = JSON.parse(localStorage.getItem('profile'));
    const currentUser = profile?.user?.emailId;

    const [loading, setLoading] = useState(false);
    const [emailList, setEmailList] = useState([]);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    // React Hook Form 
    const {
        control,
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            groupId,
            groupName: '',
            groupDescription: '',
            groupCategory: '',
            groupMembers: [currentUser],
        },
    });

    // Fetch group details and email list
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [emailResponse, groupResponse] = await Promise.all([
                    getEmailList(),
                    getGroupDetailsService({ groupId: groupId }),
                ]);

                // Populate email list
                const emailListData = emailResponse.data.users;
                //removing current user from email list as he is already set to default group member
                if (emailListData.includes(currentUser)) {
                    emailListData.splice(emailListData.indexOf(currentUser), 1);
                }
                setEmailList(emailListData);

                // Populate group details
                const groupDetails = groupResponse.data.group;
                setValue('groupName', groupDetails.groupName);
                setValue('groupDescription', groupDetails.groupDescription || '');
                setValue('groupCategory', groupDetails.groupCategory || '');
                setValue(
                    'groupMembers',
                    groupDetails.groupMembers.map((member) => member.emailId)
                );
            } catch (error) {
                setAlert(true);
                setAlertMessage('Failed to fetch group details or email list.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [groupId, setValue, currentUser]);

    // Submit handler
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await editGroupService(data);
            if (response) {
                window.location = `${configData.VIEW_GROUP_URL}${groupId}`;
            }
        } catch (error) {
            setAlert(true);
            setAlertMessage('Failed to edit group.');
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
                        Edit Group
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
                            {/* <Grid item xs={6}>
                                <FormControl fullWidth error={!!errors.groupCurrency}>
                                    <InputLabel id="group-currency-label">Currency</InputLabel>
                                    <Select
                                        labelId="group-currency-label"
                                        id="group-currency"
                                        {...register('groupCurrency')}
                                    >
                                        <MenuItem value="INR">₹ INR</MenuItem>
                                        <MenuItem value="USD">$ USD</MenuItem>
                                        <MenuItem value="EUR">€ EUR</MenuItem>
                                    </Select>
                                    <FormHelperText>{errors.groupCurrency?.message}</FormHelperText>
                                </FormControl>
                            </Grid> */}
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.groupCategory}>
                                    <InputLabel id="group-category-label">Category</InputLabel>
                                    <Select
                                        labelId="group-category-label"
                                        id="group-category"
                                        {...register('groupCategory')}
                                        input={<OutlinedInput label="Category" />}
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
                                <Button fullWidth size="large" variant="outlined" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <LoadingButton
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                >
                                    Edit Group
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </form>
                </>
            )}
        </Container>
    );
};
