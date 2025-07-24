import React from 'react';
import { useAuthStore } from '../store/authStore';
import type { AuthState } from '../store/authStore';
import { apiFetch } from '../utils/api';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    CircularProgress,
    Container,
    Chip,
    Avatar,
    Button,
    Fade,
    Slide,
    Skeleton,
} from '@mui/material';
import { keyframes } from '@mui/system';

interface Assignment {
    _id: string;
    projectId?: { name?: string };
    role?: string;
    startDate?: string;
    endDate?: string;
    allocationPercentage?: number;
    status?: string;
}

// Custom animations
const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const EngineerDashboard: React.FC = () => {
    const user = useAuthStore((state: AuthState) => state.user);
    const [assignments, setAssignments] = React.useState<Assignment[]>([]);
    const [capacity, setCapacity] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [dataLoaded, setDataLoaded] = React.useState(false);

    React.useEffect(() => {
        const fetchAssignments = async () => {
            setLoading(true);
            try {
                const res = await apiFetch(`/api/assignments/engineer/${user?._id}`);
                const data = await res.json();
                setAssignments(data);
                setTimeout(() => {
                    setLoading(false);
                    setDataLoaded(true);
                }, 500);
            } catch (error) {
                setLoading(false);
                console.error('Failed to fetch assignments:', error);
            }
        };

        const fetchCapacity = async () => {
            try {
                const res = await apiFetch(`/api/engineers/${user?._id}/capacity`);
                const data = await res.json();
                setCapacity(data.availableCapacity);
            } catch (error) {
                console.error('Failed to fetch capacity:', error);
            }
        };

        if (user) {
            fetchAssignments();
            fetchCapacity();
        }
    }, [user]);

    const maxCap = user?.maxCapacity || 100;
    const usedPercentage = capacity !== null ? ((maxCap - capacity) / maxCap) * 100 : 0;

    const getTimelineProgress = (start?: string, end?: string): number => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const currentDate = new Date();
        if (currentDate < startDate) return 0;
        if (currentDate > endDate) return 100;
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsed = currentDate.getTime() - startDate.getTime();
        return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const getDaysRemaining = (endDate?: string): string => {
        if (!endDate) return 'N/A';

        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Completed';
        if (diffDays === 0) return 'Due today';
        return `${diffDays} days`;
    };

    const getInitials = (name?: string): string => {
        if (!name) return 'U';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatShortDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
    };

    const completedAssignments = assignments.filter(a => {
        const endDate = new Date(a.endDate || '');
        const now = new Date();
        return a.status === 'completed' || endDate < now;
    }).length;

    const activeAssignments = assignments.length - completedAssignments;

    // Loading skeleton component
    const LoadingSkeleton = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2].map((item) => (
                <Card key={item} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Box>
                                <Skeleton variant="text" width={200} height={24} />
                                <Skeleton variant="text" width={150} height={18} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Skeleton variant="rounded" width={60} height={20} />
                                <Skeleton variant="rounded" width={50} height={20} />
                            </Box>
                        </Box>
                        <Skeleton variant="rectangular" width="100%" height={6} sx={{ mb: 1.5, borderRadius: 3 }} />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Skeleton variant="rounded" width={70} height={20} />
                            <Skeleton variant="rounded" width={60} height={20} />
                            <Skeleton variant="rounded" width={50} height={20} />
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 1.5, px: 1.5 }}>
            {/* Compact Header */}
            <Card
                sx={{
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                    maxWidth: 720,
                    mx: 'auto',
                    mb: 4,
                }}
            >
                {/* Gradient Header */}
                <Box
                    sx={{
                        background: '#1976D2',
                        p: 4,
                        textAlign: 'center',
                        color: '#fff',
                    }}
                >
                    <Avatar
                        sx={{
                            width: 60,
                            height: 60,
                            bgcolor: 'white',
                            color: '#4f46e5',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            mx: 'auto',
                            mb: 1,
                        }}
                    >
                        {getInitials(user?.name)}
                    </Avatar>
                    <Typography variant="h6">{user?.name || ' Unknown'}</Typography>

                </Box>

                {/* Body */}
                <Box sx={{ px: 3, py: 2 }}>
                    {/* Skills */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, width: 100 }}>
                            Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {user?.skills?.length ? (
                                user.skills.map((skill, idx) => (
                                    <Chip
                                        key={idx}
                                        size="small"
                                        label={skill}
                                        sx={{
                                            fontSize: '0.7rem',
                                            backgroundColor: '#f3f4f6',
                                            color: '#111827',
                                        }}
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" fontStyle="italic">
                                    No skills listed
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    {/* Aligned Details */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                            <Typography sx={{ fontWeight: 600, width: 100 }}>Seniority:</Typography>
                            <Typography>{user?.seniority || 'N/A'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', mb: 1 }}>
                            <Typography sx={{ fontWeight: 600, width: 100 }}>Department:</Typography>
                            <Typography>{user?.department || 'N/A'}</Typography>
                        </Box>

                    </Box>

                    {/* Capacity */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Current Capacity:
                        </Typography>

                        <LinearProgress
                            variant="determinate"
                            value={user?.maxCapacity || 85}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: (() => {
                                        const cap = user?.maxCapacity || 85;
                                        if (cap === 100) return '#22c55e'; 
                                        if (cap > 90) return '#ef4444';    
                                        if (cap > 70) return '#3b82f6';    
                                        if (cap > 50) return '#f97316';    
                                        return '#22c55e';                  
                                    })(),
                                },
                            }}
                        />

                        <Typography variant="body2" sx={{ textAlign: 'right', mt: 0.5 }}>
                            Utilization: {user?.maxCapacity || 85}%
                        </Typography>
                    </Box>

                    {/* Stats Footer */}
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    backgroundColor: '#eef4ff',
                                }}
                            >
                                <Typography variant="h6" color="#2563eb">
                                    {activeAssignments}
                                </Typography>
                                <Typography variant="body2" color="#2563eb">
                                    Active
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    textAlign: 'center',
                                    backgroundColor: '#e6f7ec',
                                }}
                            >
                                <Typography variant="h6" color="#059669">
                                    {completedAssignments}
                                </Typography>
                                <Typography variant="body2" color="#059669">
                                    Completed
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Card>

            {/* Compact Assignments Section */}
            <Fade in={dataLoaded} timeout={1200}>
                <Box sx={{ mb: 2 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{
                                mb: 0,
                                fontSize: '1.1rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                My Assignments
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                Track your current and upcoming projects
                            </Typography>
                        </Box>
                        <Chip
                            label={`Total: ${assignments.length}`}
                            size="small"
                            sx={{
                                backgroundColor: '#f5f5f5',
                                color: '#666',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                            }}
                        />
                    </Box>

                    {/* Compact Assignments List */}
                    {loading ? (
                        <LoadingSkeleton />
                    ) : assignments.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: 4,
                            px: 2,
                            background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f7ff 100%)',
                            borderRadius: 2,
                            border: '2px dashed #e0e7ff'
                        }}>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                                No assignments found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Your assignments will appear here once they're assigned to you.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {assignments.map((assignment, index) => (
                                <Fade in timeout={800 + (index * 100)} key={assignment._id}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            border: '1px solid #e8e8e8',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                borderColor: '#ddd',
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ p: 0 }}>
                                            {/* Compact Assignment Header */}
                                            <Box sx={{ p: 2, pb: 1.5 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold" sx={{
                                                            mb: 0.2,
                                                            fontSize: '0.95rem',
                                                            color: '#2c3e50'
                                                        }}>
                                                            {assignment.role || 'Frontend Developer'}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                                            {assignment.projectId?.name || 'E-commerce Platform Redesign'}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                        <Chip
                                                            label={index === 0 ? "Active" : (assignment.status || 'Active')}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: index === 0 ? '#e3f2fd' : '#fff3e0',
                                                                color: index === 0 ? '#1976d2' : '#f57c00',
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem',
                                                                height: '20px',
                                                            }}
                                                        />
                                                        {index === 0 && (
                                                            <Chip
                                                                label="HIGH"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: '#ffebee',
                                                                    color: '#d32f2f',
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem',
                                                                    height: '20px',
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Compact Date and Allocation */}
                                                <Grid container spacing={1} sx={{ mb: 1.5 }}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                                            📅 {formatDate(assignment.startDate)} - {formatDate(assignment.endDate)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                                                            👤 {assignment.allocationPercentage ? `${assignment.allocationPercentage}%` : '100%'} Allocation
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            <Box sx={{ px: 2, pb: 2 }}>
                                                {/* Compact Progress Section */}
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" fontWeight="bold" color="#34495e" sx={{ fontSize: '0.8rem' }}>
                                                            Progress
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>
                                                            {`${Math.round(getTimelineProgress(assignment.startDate, assignment.endDate))}%`}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={getTimelineProgress(assignment.startDate, assignment.endDate)}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: '#f5f5f5',
                                                            '& .MuiLinearProgress-bar': {
                                                                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                                borderRadius: 3,
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* Compact Timeline Section */}
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                        <Typography variant="body2" fontWeight="bold" color="#34495e" sx={{ fontSize: '0.8rem' }}>
                                                            Timeline
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold" color="#2196f3" sx={{ fontSize: '0.8rem' }}>
                                                            {getDaysRemaining(assignment.endDate)}
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={getTimelineProgress(assignment.startDate, assignment.endDate)}
                                                        sx={{
                                                            height: 6,
                                                            borderRadius: 3,
                                                            backgroundColor: '#f5f5f5',
                                                            '& .MuiLinearProgress-bar': {
                                                                background: 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%)',
                                                                borderRadius: 3,
                                                            }
                                                        }}
                                                    />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                                                            {formatShortDate(assignment.startDate) || 'Start'}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                                                            {formatShortDate(assignment.endDate) || 'End'}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Compact Required Skills */}
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1, color: '#34495e', fontSize: '0.8rem' }}>
                                                        Required Skills:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        {assignment?.projectId?.requiredSkills?.length ? (
                                                            assignment?.projectId?.requiredSkills?.map((skill, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={skill}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: idx % 2 === 0 ? '#e3f2fd' : '#e8f5e8',
                                                                        color: idx % 2 === 0 ? '#1976d2' : '#2e7d32',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.7rem',
                                                                        height: '20px',
                                                                    }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ fontSize: '0.8rem' }}>
                                                                No skills listed
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            ))}
                        </Box>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default EngineerDashboard;
