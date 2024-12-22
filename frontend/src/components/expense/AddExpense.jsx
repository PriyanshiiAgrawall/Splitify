import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
    Modal,
    OutlinedInput,
    Select,
    TextField,
    Typography,
    Snackbar,
    Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import useResponsive from '../theme/hooks/useResponsive';
import { addExpenseService } from '../../services/expenseServices';
import { currencyFind } from '../../utils/helper';
import configData from '../../config.json';
import { useParams, Link as RouterLink } from 'react-router-dom';
import Loading from '../loading';
import AlertBanner from '../AlertBanner';
import { getGroupDetailsService } from '../../services/groupService';

export default function AddExpense() {
    const { groupId } = useParams();
    const mdUp = useResponsive('up', 'md');
    const profile = JSON.parse(localStorage.getItem('profile'));
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [groupCurrency, setGroupCurrency] = useState('');

    const currentUser = profile?.user?.emailId;

    // React Hook Form
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm({
        defaultValues: {
            expenseName: '',
            expenseDescription: '',
            expenseAmount: '',
            expenseCategory: '',
            expenseDate: new Date(),
            expenseMembers: [],
            expenseCreatedBy: currentUser,
            expensePaidBy: '',
            groupId: groupId,
            expenseType: 'Cash',
        },
    });

    // Fetch group details on mount
    useEffect(() => {
        const fetchGroupDetails = async () => {
            setLoading(true);
            try {
                const groupIdJson = { groupId: groupId };
                const response_group = await getGroupDetailsService(groupIdJson, setAlert, setAlertMessage);
                setGroupCurrency(response_group?.data?.group?.groupCurrency || '');
                setGroupMembers(response_group?.data?.group?.groupMembers || []);
                setValue('expenseMembers', response_group?.data?.group?.groupMembers || []);
            } catch (error) {
                setAlertMessage('Failed to fetch group details.');
                setAlert(true);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupDetails();
    }, [groupId, setValue]);

    // Submit handler
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (await addExpenseService(data, setAlert, setAlertMessage)) {
                window.location = configData.VIEW_GROUP_URL + groupId;
            }
        } catch (error) {
            setAlertMessage('Failed to add expense.');
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
                        Add Expense
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Expense Name"
                                    {...register('expenseName', { required: 'Expense name is required' })}
                                    error={!!errors.expenseName}
                                    helperText={errors.expenseName?.message}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    multiline
                                    rows={2}
                                    fullWidth
                                    label="Expense Description"
                                    {...register('expenseDescription')}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Expense Amount"
                                    type="number"
                                    {...register('expenseAmount', { required: 'Amount is required' })}
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
                                    <Select
                                        {...register('expenseCategory', { required: 'Category is required' })}
                                        label="Expense Category"
                                    >
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
                                                    inputFormat="dd/MM/yyyy"
                                                    {...field}
                                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                                />
                                            ) : (
                                                <MobileDatePicker
                                                    label="Expense Date"
                                                    inputFormat="dd/MM/yyyy"
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
                                    <Select
                                        multiple
                                        {...register('expenseMembers', {
                                            required: 'At least one member is required',
                                        })}
                                        input={<OutlinedInput label="Expense Members" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {groupMembers.map((member) => (
                                            <MenuItem key={member} value={member}>
                                                {member}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.expenseMembers?.message}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.expensePaidBy}>
                                    <InputLabel>Expense Paid By</InputLabel>
                                    <Select

                                        {...register('expensePaidBy', {
                                            required: 'Please select who paid the expense',
                                        })}
                                        input={<OutlinedInput label="Expense Members" />}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} />
                                                ))}
                                            </Box>
                                        )}
                                    >
                                        {groupMembers.map((member) => (
                                            <MenuItem key={member} value={member}>
                                                {member}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>{errors.expensePaidBy?.message}</FormHelperText>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Payment Method</InputLabel>
                                    <Select
                                        {...register('expenseType')}
                                        defaultValue="Cash"
                                        label="Payment Method"
                                    >
                                        <MenuItem value="Cash">Cash</MenuItem>
                                        <MenuItem value="Online">Online</MenuItem>
                                        <MenuItem value="Card">Card</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    fullWidth
                                    size="large"
                                    variant="outlined"
                                    component={RouterLink}
                                    to={configData.VIEW_GROUP_URL + groupId}
                                >
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <LoadingButton
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    variant="contained"
                                    loading={isSubmitting}
                                >
                                    Add Expense
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            )}
        </>
    );
}
