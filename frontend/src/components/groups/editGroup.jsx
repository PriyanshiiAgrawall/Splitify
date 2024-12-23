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
    Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useResponsive from '../theme/hooks/useResponsive';
import { getEmailList } from '../../services/authentication';
import { getGroupDetailsService, editGroupService } from '../../services/groupService';
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
        .min(1, 'At least one group member is required')
        .optional(),
});

export default function EditGroup() {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const mdUp = useResponsive('up', 'md');
    const profile = JSON.parse(localStorage.getItem('profile'));
    const currentUser = profile?.user?.emailId;

    const [loading, setLoading] = useState(false);
    const [emailList, setEmailList] = useState([]);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const {
        control,
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            groupId,
            groupName: '',
            groupDescription: '',
            groupCategory: '',
            groupMembers: [],
        },
    });

    const groupMembers = watch('groupMembers'); // Watch groupMembers field

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const payload = { id: groupId };
                const [emailResponse, groupResponse] = await Promise.all([
                    getEmailList(),
                    getGroupDetailsService(payload),
                ]);

                const groupDetails = groupResponse.data.group;

                // Populate email list excluding current group members
                const emailListData = emailResponse.data.users.filter(
                    (email) => !groupDetails.groupMembers.some((member) => member.emailId === email)
                );
                setEmailList(emailListData);

                // Set initial values for the form
                setValue('groupName', groupDetails.groupName || '');
                setValue('groupDescription', groupDetails.groupDescription || '');
                setValue('groupCategory', groupDetails.groupCategory || 'Others');
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
    }, [groupId, setValue]);

    const handleDeleteMember = (member, event) => {

        event.stopPropagation();
        console.log(`Removing member: ${member}`);
        const updatedMembers = groupMembers.filter((item) => item !== member);

        if (updatedMembers.length === 0) {
            // Show the alert message for 5 seconds
            setAlert(true);
            setAlertMessage('You cannot remove all members of the group');
            setTimeout(() => {
                setAlert(false);
                setAlertMessage('');
            }, 5000); // 5000ms = 5 seconds
            return;
        }

        // Update group members and add removed member back to email list
        setValue('groupMembers', updatedMembers);
        setEmailList((prevList) => [...prevList, member]);
    };

    const handleAddMember = (selectedMembers) => {
        // Find newly added members and remove them from the dropdown
        console.log(selectedMembers)
        const addedMembers = selectedMembers.filter((member) => !groupMembers.includes(member));
        setEmailList((prevList) => prevList.filter((email) => !addedMembers.includes(email)));

        setValue('groupMembers', selectedMembers);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const payload = {
                groupId: data.groupId,
                groupName: data.groupName || undefined,
                groupDescription: data.groupDescription || undefined,
                groupCategory: data.groupCategory || 'Others',
                groupMembers: data.groupMembers,
            };

            const response = await editGroupService(payload);
            if (response.success) {
                window.location = `${configData.VIEW_GROUP_URL}${groupId}`;
            }
        } catch (error) {
            setAlert(true);
            setAlertMessage('Failed to edit group.');
        } finally {
            setLoading(false);
        }
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
                                                value={field.value || []}
                                                onChange={(event) => handleAddMember(event.target.value)}
                                                renderValue={(selected) => (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {selected.map((value) => (
                                                            <Chip
                                                                key={value}
                                                                label={value}
                                                                onMouseDown={(event) =>
                                                                    handleDeleteMember(value, event)
                                                                }
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
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

                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.groupCategory}>
                                    <InputLabel id="group-category-label">Category</InputLabel>
                                    <Select
                                        labelId="group-category-label"
                                        id="group-category"
                                        {...register('groupCategory')}
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
}
