import React, { useEffect, useState } from 'react';
import {
    Box,
    Chip,
    Container,
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
    Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useResponsive from '../theme/hooks/useResponsive';
import { addExpenseService } from '../../services/expenseServices';
import { getGroupDetailsService } from '../../services/groupService';
import Loading from '../loading';
import AlertBanner from '../AlertBanner';
import configData from '../../config.json';
import { currencyFind } from '../../utils/helper';

// Zod schema for validation
const schema = z.object({
    expenseName: z.string().nonempty('Expense name is required'),
    expenseDescription: z.string().max(100, "Description is too long").optional(),
    expenseAmount: z.string().min(0, 'Amount must be greater than 0'),
    expenseCategory: z.string().nonempty('Category is required'),
    expenseDate: z.date(),
    expenseMembers: z.array(z.string().nonempty('Member ID is required')).min(1, 'At least one member is required'),
    expensePaidBy: z.string().nonempty('Expense paid by is required'),
    expenseType: z.string().optional(),
});

export default function AddExpense() {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const mdUp = useResponsive('up', 'md');
    const profile = JSON.parse(localStorage.getItem('profile'));
    const currentUser = profile?.user?.emailId;

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [groupMembers, setGroupMembers] = useState([]);
    const [emailList, setEmailList] = useState([]);
    const [groupCurrency, setGroupCurrency] = useState('');

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

    useEffect(() => {
        const fetchGroupDetails = async () => {
            setLoading(true);
            try {
                const response = await getGroupDetailsService({ id: groupId });
                const groupDetails = response.data.group;

                setGroupCurrency(groupDetails.groupCurrency || '');
                const members = groupDetails.groupMembers.map((member) => member.emailId) || [];
                setGroupMembers(members);
                setValue('expenseMembers', members);
                setEmailList(members.filter((member) => !members.includes(member)));
            } catch (error) {
                setAlertMessage('Failed to fetch group details.');
                setAlert(true);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupDetails();
    }, [groupId, setValue]);

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

    const handleAddMember = (selectedMembers) => {
        const addedMembers = selectedMembers.filter((member) => !expenseMembers.includes(member));
        setEmailList((prevList) => prevList.filter((email) => !addedMembers.includes(email)));
        setValue('expenseMembers', selectedMembers);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                groupId,
                expenseOwner: currentUser,
            };
            const response = await addExpenseService(payload);

            if (response.status === 200) {
                navigate(`${configData.VIEW_GROUP_URL}${groupId}`);
            }
        } catch (error) {
            setAlertMessage('Failed to add expense.');
            setAlert(true);
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
                        Add Expense
                    </Typography>
                    <AlertBanner showAlert={alert} alertMessage={alertMessage} severity="error" />
                    <form onSubmit={handleSubmit(onSubmit)}>
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
                                    rows={3}
                                    label="Expense Description"
                                    {...register('expenseDescription')}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    name="expenseAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            label="Expense Amount"
                                            type="text" // Keep it as text to allow proper sanitization
                                            {...field}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        {currencyFind(groupCurrency)}
                                                    </InputAdornment>
                                                ),
                                            }}
                                            error={!!errors.expenseAmount}
                                            helperText={errors.expenseAmount?.message}
                                            onChange={(event) => {
                                                // Ensure only numeric values are passed to the field value
                                                const numericValue = event.target.value.replace(/[^\d.]/g, ''); // Remove non-numeric characters
                                                field.onChange(numericValue); // Update the field value
                                            }}
                                            value={field.value || ''} // Ensure the value is always a string
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <Controller
                                    name="expenseCategory"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Expense Category"
                                            fullWidth
                                            {...field}
                                            error={!!errors.expenseCategory}
                                            helperText={errors.expenseCategory?.message}
                                        >
                                            <MenuItem value="Food & drink">Food & drink</MenuItem>
                                            <MenuItem value="Shopping">Shopping</MenuItem>
                                            <MenuItem value="Entertainment">Entertainment</MenuItem>
                                            <MenuItem value="Home">Home</MenuItem>
                                            <MenuItem value="Transportation">Transportation</MenuItem>
                                            <MenuItem value="Others">Others</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Controller
                                    name="expensePaidBy"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select
                                            label="Expense Paid By"
                                            fullWidth
                                            {...field}
                                            error={!!errors.expensePaidBy}
                                            helperText={errors.expensePaidBy?.message}
                                        >

                                            {groupMembers.map((member) => (
                                                <MenuItem key={member} value={member}>
                                                    {member}
                                                </MenuItem>
                                            ))}
                                        </TextField>
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
                                                input={<OutlinedInput label="Expense Members" />}
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
                                <Controller
                                    name="expenseDate"
                                    control={control}
                                    render={({ field }) => (
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            {mdUp ? (
                                                <DesktopDatePicker
                                                    label="Expense Date"
                                                    inputFormat="MM/dd/yyyy"
                                                    {...field}
                                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                                />
                                            ) : (
                                                <MobileDatePicker
                                                    label="Expense Date"
                                                    inputFormat="MM/dd/yyyy"
                                                    {...field}
                                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                                />
                                            )}
                                        </LocalizationProvider>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Controller
                                    name="expenseType"
                                    control={control}
                                    rules={{ required: "Payment Method is required" }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.expenseType}>
                                            <InputLabel id="expense-type-label">Payment Method</InputLabel>
                                            <Select
                                                {...field}
                                                labelId="expense-type-label"
                                                id="expense-type-select"
                                                label="Payment Method"
                                            >
                                                <MenuItem value="Cash">Cash</MenuItem>
                                                <MenuItem value="Online">Online</MenuItem>
                                                <MenuItem value="Card">Card</MenuItem>
                                            </Select>
                                            <FormHelperText>
                                                {errors.expenseType?.message}
                                            </FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <Button fullWidth size="large" variant="outlined" onClick={() => navigate(-1)}>
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
                </>
            )}
        </Container>
    );
}
