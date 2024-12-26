import { Container, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getGroupDetailsService } from "../../../services/groupService";
import AlertBanner from "../../AlertBanner";
import Loading from "../../loading";
import 'chart.js/auto';
import { Bar } from "react-chartjs-2";
import useResponsive from "../../theme/hooks/useResponsive";

const UserBalanceChart = () => {
    const params = useParams();
    const mdUp = useResponsive('up', 'md');
    const [loading, setLoading] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const [graphLabel, setGraphLabel] = useState([]);
    const [alert, setAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState();

    const data = {
        labels: graphLabel,
        datasets: [
            {
                label: 'User Balance',
                data: graphData,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
            }
        ]
    };

    const options = {
        scales: {
            x: {
                ticks: {
                    display: mdUp
                },
            }
        },
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        }
    };

    useEffect(() => {
        const getGroupDetails = async () => {
            setLoading(true);
            const groupIdJson = {
                id: params.groupId
            };
            try {
                const response_group = await getGroupDetailsService(groupIdJson, setAlert, setAlertMessage);

                if (response_group?.data?.group?.split) {
                    const splits = response_group.data.group.split;

                    // Filter and map the split data for chart
                    const filteredSplits = splits.filter(split => split.amount < 0);
                    const labels = filteredSplits.map(split => `${split.member.firstName} ${split.member.lastName}`);
                    const data = filteredSplits.map(split => Math.abs(split.amount));

                    setGraphLabel(labels);
                    setGraphData(data);
                }
            } catch (error) {
                setAlert(true);
                setAlertMessage("Failed to load group details.");
            } finally {
                setLoading(false);
            }
        };
        getGroupDetails();
    }, [params.groupId]);

    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <Container sx={{ my: 6 }}>
                    <AlertBanner showAlert={alert} alertMessage={alertMessage} severity="error" />
                    <Box height={350} my={2}>
                        <Bar data={data} options={options} />
                    </Box>
                </Container>
            )}
        </>
    );
};

export default UserBalanceChart;
