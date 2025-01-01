import { Grid, CardActionArea, CardContent, CardMedia, Typography, Container, Card, Box, Link, alpha, Fab } from "@mui/material";
import { useEffect, useState } from "react";
import { getUserGroupsService } from "../../services/groupService";
import Iconify from "../Iconify";
import Loading from "../Loading.jsx";
import GroupCards from "./GroupCards";
import { Link as RouterLink } from 'react-router-dom';
import dataConfig from '../../config.json';

const profile = JSON.parse(localStorage.getItem('profile'));
const emailId = profile?.user?.emailId;

export default function Group() {
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState([]);
    const colors = ['primary', 'secondary', 'error', 'warning', 'info', 'success'];

    useEffect(() => {
        const getUserGroups = async () => {
            setLoading(true);
            try {
                const responseGroup = await getUserGroupsService(profile); // Sending the entire profile

                setGroups(responseGroup?.data?.groups || []);
            } catch (error) {
                console.error("Failed to fetch user groups:", error);
            } finally {
                setLoading(false);
            }
        };
        getUserGroups();
    }, []);

    // Check if the group is active based on the split array of the current user
    const checkActive = (split) => {
        if (!split) return false;
        return split.some((entry) => Math.round(entry.amount) !== 0);
    };

    return (
        <Container>
            {loading ? (
                <Loading />
            ) : (
                <>
                    <Fab
                        component={RouterLink}
                        to={dataConfig.CREATE_GROUP_URL}
                        color="primary"
                        aria-label="add"
                        sx={{
                            margin: 0,
                            top: 'auto',
                            right: 20,
                            bottom: 20,
                            left: 'auto',
                            position: 'fixed',
                        }}
                    >
                        <Iconify icon="fluent:people-team-add-20-filled" sx={{ width: '100%', height: 20 }} />
                    </Fab>
                    <Typography variant="h3" pb={2}>
                        Your Groups,
                    </Typography>
                    <Grid container spacing={4}>
                        {groups?.map((group, index) => (
                            <Grid item xs={12} md={6} lg={6} key={group?._id}>
                                <Link
                                    component={RouterLink}
                                    to={`${dataConfig.VIEW_GROUP_URL}${group?._id}`}
                                    sx={{ textDecoration: 'none' }}
                                >
                                    <GroupCards
                                        groupId={group?._id}
                                        title={group?.groupName}
                                        description={group?.groupDescription}
                                        groupMembers={group?.groupMembers?.map((member) => member.emailId) || []}
                                        share={
                                            group?.split?.find((entry) => entry.member.emailId === emailId)?.amount || 0
                                        }
                                        currencyType={group?.groupCurrency}
                                        groupCategory={group?.groupCategory}
                                        isGroupActive={checkActive(group?.split)}
                                        color={colors[index % colors.length]} // Use index for consistent colors
                                    />
                                </Link>
                            </Grid>
                        ))}
                        <Grid item xs={12} md={6} lg={6}>
                            <Link
                                component={RouterLink}
                                to={dataConfig.CREATE_GROUP_URL}
                                sx={{ textDecoration: 'none' }}
                            >
                                <Card
                                    sx={{
                                        p: 0,
                                        boxShadow: 10,
                                        borderRadius: 2,
                                        backgroundImage: (theme) =>
                                            `linear-gradient(169deg, ${alpha(theme.palette['primary'].light, 0.6)} 0%, ${alpha(
                                                theme.palette['primary'].darker,
                                                0.55
                                            )} 70%)`,
                                        minHeight: 310,
                                    }}
                                >
                                    <Grid
                                        container
                                        direction="row"
                                        justifyContent="center"
                                        alignItems="center"
                                        minHeight={310}
                                    >
                                        <Grid item xs={'auto'} md={'auto'}>
                                            <Iconify
                                                icon="fluent:people-team-add-20-filled"
                                                color={'#fff'}
                                                sx={{ width: '100%', height: 50 }}
                                            />
                                            <Typography
                                                variant="h4"
                                                fontSize={28}
                                                color="#fff"
                                                sx={{
                                                    width: '100%',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Create new group!
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Link>
                        </Grid>
                    </Grid>
                </>
            )}
        </Container>
    );
}
