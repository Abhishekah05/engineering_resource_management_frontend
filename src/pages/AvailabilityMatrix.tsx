import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Card,
    CardContent,
    LinearProgress,
    Grid,
    Chip,
    Alert,
    CircularProgress,
    Avatar,
    Divider,
    Paper,
    Fade,
    Slide,
} from '@mui/material';
import {
    Group as GroupIcon,
    Business as BusinessIcon,
    Psychology as PsychologyIcon,
    TrendingUp as TrendingUpIcon,
    Assignment as AssignmentIcon,
    Person as PersonIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import { apiFetch } from '../utils/api';

interface EngineerAvailability {
    id: string;
    name: string;
    department?: string;
    skills?: string[];
    available: number;
    currentAllocation: number;
    assignments: {
        startDate?: string;
        endDate?: string;
        allocationPercentage?: number;
        projectId?: { name: string };
    }[];
}

const AvailabilityPlanning: React.FC = () => {
    const [data, setData] = useState<EngineerAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const res = await apiFetch('/api/assignments/availability');
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError('Failed to load availability data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, []);

    const getUtilizationColor = (utilization: number) => {
        if (utilization > 90) return '#f44336'; 
        if (utilization > 70) return '#ff9800'; 
        if (utilization > 50) return '#2196f3'; 
        return '#4caf50'; // Green
    };

    const getUtilizationStatus = (utilization: number) => {
        if (utilization > 90) return 'Overloaded';
        if (utilization > 70) return 'High Load';
        if (utilization > 50) return 'Moderate';
        return 'Available';
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box
                    py={8}
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="60vh"
                >
                    <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Loading availability data...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Box py={4}>
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: 3,
                            '& .MuiAlert-icon': {
                                fontSize: '1.5rem',
                            },
                        }}
                    >
                        {error}
                    </Alert>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <Fade in timeout={800}>
                <Box>
                    {/* Header Section */}
                    <Box
                        sx={{
                            textAlign: 'center',
                            mb: 3,
                            maxWidth: 700,
                            mx: 'auto',
                            background: '#1976D2',
                            borderRadius: 4,
                            p: 4,
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                                opacity: 0.3,
                            }
                        }}
                    >

                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            >
                                <GroupIcon sx={{ fontSize: '2rem' }} />
                            </Avatar>
                        </Box>
                        <Typography
                            variant="h4"
                            fontWeight="700"
                            gutterBottom
                            sx={{ position: 'relative', zIndex: 1 }}
                        >
                            Team Availability Overview
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                opacity: 0.9,
                                maxWidth: 600,
                                mx: 'auto',
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            Monitor and plan your team's capacity and current workload distribution
                        </Typography>
                    </Box>

                    {/* Stats Summary */}
                    <Grid container spacing={2} sx={{ mb: 3, marginLeft: 40 }}>
                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="#1976d2">
                                    {data.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Engineers
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="#388e3c">
                                    {data.filter(eng => {
                                        const utilization = (eng.currentAllocation / (eng.available + eng.currentAllocation)) * 100;
                                        return utilization <= 70;
                                    }).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Available Resources
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="#f57c00">
                                    {data.filter(eng => {
                                        const utilization = (eng.currentAllocation / (eng.available + eng.currentAllocation)) * 100;
                                        return utilization > 70;
                                    }).length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    High Utilization
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Engineers Grid */}
                    <Grid container spacing={3}>
                        {data.map((eng, index) => {
                            const utilization = (eng.currentAllocation / (eng.available + eng.currentAllocation)) * 100;
                            const utilizationColor = getUtilizationColor(utilization);
                            const status = getUtilizationStatus(utilization);

                            return (
                                <Grid item xs={12} lg={6} key={eng.id}>
                                    <Slide direction="up" in timeout={600 + index * 100}>
                                        <Card
                                            elevation={4}
                                            sx={{
                                                borderRadius: 4,
                                                marginLeft: 45,
                                                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                                                border: '1px solid #e0e7ff',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                {/* Engineer Header */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            bgcolor: utilizationColor,
                                                            mr: 2,
                                                            fontSize: '1.2rem',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {eng.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                            {eng.name}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            <BusinessIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {eng.department || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Chip
                                                        label={status}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: utilizationColor,
                                                            color: 'white',
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                </Box>

                                                {/* Skills Section */}
                                                {eng.skills && eng.skills.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            <PsychologyIcon sx={{ fontSize: 16, mr: 0.5, color: '#1976D2' }} />
                                                            <Typography variant="body2" fontWeight="600" color="#1976D2">
                                                                Skills
                                                            </Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                            {eng.skills.map((skill) => (
                                                                <Chip
                                                                    key={skill}
                                                                    label={skill}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        borderColor: '#1976D2',
                                                                        color: '#1976D2',
                            
                                                                    }}
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                <Divider sx={{ my: 2, bgcolor: 'rgba(99, 102, 241, 0.1)' }} />

                                                {/* Capacity & Utilization */}
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <SpeedIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                                            <Typography variant="body2" fontWeight="600">
                                                                Available Capacity: {eng.available}%
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ color: utilizationColor }}>
                                                            {utilization.toFixed(1)}% utilized
                                                        </Typography>
                                                    </Box>

                                                    <LinearProgress
                                                        value={Math.min(utilization, 100)}
                                                        variant="determinate"
                                                        sx={{
                                                            height: 10,
                                                            borderRadius: 5,
                                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                                            '& .MuiLinearProgress-bar': {
                                                                borderRadius: 5,
                                                                backgroundColor: utilizationColor,
                                                            },
                                                        }}
                                                    />
                                                </Box>

                                                {/* Current Assignments */}
                                                {eng.assignments && eng.assignments.length > 0 && (
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                            <AssignmentIcon sx={{ fontSize: 16, mr: 0.5, color: '#f57c00' }} />
                                                            <Typography variant="body2" fontWeight="600" color="#f57c00">
                                                                Current Assignments
                                                            </Typography>
                                                        </Box>
                                                        <Box
                                                            sx={{
                                                                maxHeight: 120,
                                                                overflowY: 'auto',
                                                                bgcolor: 'rgba(245, 124, 0, 0.05)',
                                                                borderRadius: 2,
                                                                p: 1.5,
                                                            }}
                                                        >
                                                            {eng.assignments.map((assignment, idx) => (
                                                                <Box key={idx} sx={{ mb: 1, '&:last-child': { mb: 0 } }}>
                                                                    <Typography variant="body2" fontWeight="600" color="text.primary">
                                                                        {assignment.projectId?.name || 'Unknown Project'}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {assignment.startDate?.slice(0, 10)} to {assignment.endDate?.slice(0, 10)}
                                                                        <Chip
                                                                            label={`${assignment.allocationPercentage}%`}
                                                                            size="small"
                                                                            sx={{
                                                                                ml: 1,
                                                                                height: 20,
                                                                                fontSize: '0.7rem',
                                                                                bgcolor: 'rgba(245, 124, 0, 0.1)',
                                                                                color: '#f57c00',
                                                                            }}
                                                                        />
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* No assignments message */}
                                                {(!eng.assignments || eng.assignments.length === 0) && (
                                                    <Box
                                                        sx={{
                                                            textAlign: 'center',
                                                            py: 2,
                                                            bgcolor: 'rgba(76, 175, 80, 0.05)',
                                                            borderRadius: 2,
                                                            border: '1px dashed rgba(76, 175, 80, 0.3)',
                                                        }}
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            No current assignments - Fully available
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Slide>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Empty state */}
                    {data.length === 0 && (
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 8,
                                bgcolor: 'rgba(0,0,0,0.02)',
                                borderRadius: 4,
                                border: '2px dashed rgba(0,0,0,0.1)',
                            }}
                        >
                            <GroupIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No engineer data available
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                Check back later or contact your administrator
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default AvailabilityPlanning;
