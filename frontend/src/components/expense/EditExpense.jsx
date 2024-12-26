import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    FormControl,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useResponsive from '../theme/hooks/useResponsive';
import { currencyFind } from '../../utils/helper';
import { editExpenseService, getExpDetailsService } from '../../services/expenseServices';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupDetailsService } from '../../services/groupService';
import AlertBanner from '../AlertBanner';
import Loading from '../loading';

const schema = z.object({
    expenseName: z.string().optional(),
    expenseDescription: z.string().optional(),
    expenseAmount: z.number().positive('Amount must be a positive number').optional(),
    expenseCategory: z.string().optional(),
    expenseDate: z.date().optional(),
    expenseMembers: z.array(z.string().email()).optional(),
    expensePaidBy: z.string().email().optional(),
    expenseType: z.string().optional(),
});

export default function EditExpense() {
    const navigate = useNavigate();
    const { expenseId } = useParams();
    const mdUp = useResponsive('up', 'md');

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [emailList, setEmailList] = useState([]);
    const [groupCurrency, setGroupCurrency] = useState('');
    const [groupId, setGroupId] = useState('');

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
            expenseName: '',
            expenseDescription: '',
            expenseAmount: '',
            expenseCategory: '',
            expenseDate: new Date(),
            expenseMembers: [],
            expensePaidBy: '',
            expenseType: 'Cash',
        },
    });

    const expenseMembers = watch('expenseMembers');

    // Fetch Expense Details and Group Members
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const expenseResponse = await getExpDetailsService({ id: expenseId }, setAlert, setAlertMessage);
                const expenseDetails = expenseResponse?.data?.expense;

                const groupResponse = await getGroupDetailsService({ id: expenseDetails?.groupId }, setAlert, setAlertMessage);
                const groupMembers = groupResponse?.data?.group?.groupMembers || [];

                // Set Form Values
                setValue('expenseName', expenseDetails?.expenseName || '');
                setValue('expenseDescription', expenseDetails?.expenseDescription || '');
                setValue('expenseAmount', expenseDetails?.expenseAmount || '');
                setValue('expenseCategory', expenseDetails?.expenseCategory || '');
                setValue('expenseDate', new Date(expenseDetails?.expenseDate) || new Date());
                setValue('expenseMembers', expenseDetails?.expenseMembers.map((m) => m.emailId) || []);
                setValue('expensePaidBy', expenseDetails?.expensePaidBy.emailId || '');
                setValue('expenseType', expenseDetails?.expenseType || 'Cash');

                setGroupMembers(groupMembers);
                setEmailList(groupMembers.map((m) => m.emailId).filter((email) => !expenseMembers.includes(email)));
                setGroupCurrency(expenseDetails?.expenseCurrency);
                setGroupId(expenseDetails.groupId)
            } catch (error) {
                setAlert(true);
                setAlertMessage('Failed to fetch details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [expenseId, setValue]);

    // Add Member Handler
    const handleAddMember = (selectedMembers) => {
        const addedMembers = selectedMembers.filter((member) => !expenseMembers.includes(member));
        setEmailList((prevList) => prevList.filter((email) => !addedMembers.includes(email)));
        setValue('expenseMembers', selectedMembers);
    };

    // Delete Member Handler
    const handleDeleteMember = (member, event) => {
        event.stopPropagation();
        const updatedMembers = expenseMembers.filter((item) => item !== member);

        if (updatedMembers.length === 0) {
            setAlert(true);
            setAlertMessage('Expense must have at least one member.');
            setTimeout(() => {
                setAlert(false);
                setAlertMessage('');
            }, 5000);
            return;
        }

        setValue('expenseMembers', updatedMembers);
        setEmailList((prevList) => [...prevList, member]);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (await editExpenseService({ ...data, id: expenseId, groupId: groupId._id, }, setAlert, setAlertMessage)) {
                navigate(-1);
            }
        } catch (error) {
            setAlertMessage('Failed to edit expense.');
            setAlert(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <Box
                    sx={{
                        position: 'relative',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        ...(mdUp && { width: 700 }),
                    }}
                >
                    <AlertBanner showAlert={alert} alertMessage={alertMessage} severity="error" />
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                        Edit Expense
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Expense Name"
                                    {...register('expenseName')}
                                    error={!!errors.expenseName}
                                    helperText={errors.expenseName?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Expense Description"
                                    {...register('expenseDescription')}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Expense Amount"
                                    type="number"
                                    {...register('expenseAmount', { valueAsNumber: true })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                {currencyFind(groupCurrency)}
                                            </InputAdornment>
                                        ),
                                    }}
                                    error={!!errors.expenseAmount}
                                    helperText={errors.expenseAmount?.message}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth error={!!errors.expenseCategory}>
                                    <InputLabel>Expense Category</InputLabel>
                                    <Select {...register('expenseCategory')} label="Expense Category">
                                        <MenuItem value="Food & drink">Food & drink</MenuItem>
                                        <MenuItem value="Shopping">Shopping</MenuItem>
                                        <MenuItem value="Entertainment">Entertainment</MenuItem>
                                        <MenuItem value="Home">Home</MenuItem>
                                        <MenuItem value="Transportation">Transportation</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                    </Select>
                                    <FormHelperText>{errors.expenseCategory?.message}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="expenseDate"
                                    control={control}
                                    render={({ field }) => (
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            {mdUp ? (
                                                <DesktopDatePicker
                                                    label="Expense Date"
                                                    {...field}
                                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                                />
                                            ) : (
                                                <MobileDatePicker
                                                    label="Expense Date"
                                                    {...field}
                                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                                />
                                            )}
                                        </LocalizationProvider>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.expenseMembers}>
                                    <InputLabel>Expense Members</InputLabel>
                                    <Controller
                                        name="expenseMembers"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                multiple
                                                {...field}
                                                input={<OutlinedInput />}
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
                                    <FormHelperText>{errors.expenseMembers?.message}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.expensePaidBy}>
                                    <InputLabel>Expense Paid By</InputLabel>
                                    <Select {...register('expensePaidBy')} label="Expense Paid By">
                                        {groupMembers.map((member) => (
                                            <MenuItem key={member.emailId} value={member.emailId}>
                                                {member.emailId}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.expensePaidBy?.message}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <Button fullWidth size="large" variant="outlined" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                                    Edit
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            )}
        </>
    );
}
