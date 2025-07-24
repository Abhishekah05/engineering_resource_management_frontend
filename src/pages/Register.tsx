
import React from 'react';
import { useForm } from 'react-hook-form';
import { apiFetch } from '../utils/api';

import {
    Box,
    Button,
    Container,
    Typography,
    TextField,
    MenuItem,
    Alert,
    Paper,
    Grid,
    InputAdornment,
    Fade,
    Chip,
    Divider,
} from '@mui/material';
import {
    Person,
    Email,
    Lock,
    Work,
    Star,
    BusinessCenter,
    Speed,
} from '@mui/icons-material';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    role: 'engineer' | 'manager';
    skills: string;
    seniority: 'junior' | 'mid' | 'senior';
    maxCapacity: number;
    department: string;
}

const Register: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const selectedRole = watch('role');


    const onSubmit = async (data: RegisterForm) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await apiFetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                      ...data,
                      skills:
                    data.role === 'engineer' && data.skills
                      ? data.skills.split(',').map((s) => s.trim())
                      : [],
                }),

            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Registration failed');

            setSuccess('Registration successful! You can now log in.');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const getSeniorityColor = (seniority: string) => {
        switch (seniority) {
            case 'junior': return '#4CAF50';
            case 'mid': return '#FF9800';
            case 'senior': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    return (
        <Box
            sx={{
                minHeight: '80vh',
                
                display: 'flex',
                alignItems: 'center',
                py: 4,
            }}
        >
            <Container maxWidth="md">
                <Fade in timeout={800}>
                    <Paper
                        elevation={24}
                        sx={{
                            borderRadius: 4,
                            overflow: 'hidden',
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        }}
                    >
                        <Box
                            sx={{
                                background: '#1976D2',
                                p: 4,
                                textAlign: 'center',
                                color: 'white',
                            }}
                        >
                            <Typography
                                variant="h3"
                                fontWeight="700"
                                sx={{
                                    mb: 1,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                }}
                            >
                                Join Our Team
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Create your account and start collaborating
                            </Typography>
                        </Box>

                        <Box sx={{ p: 5 }}>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <Grid container spacing={3}>
                                    {/* Personal Information Section */}
                                    <Grid item xs={12}>
                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label="Personal Information"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Full Name"
                                            fullWidth
                                            variant="outlined"
                                            error={!!errors.name}
                                            helperText={errors.name ? 'Name is required' : ''}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Person color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    },
                                                },
                                            }}
                                            {...register('name', { required: true })}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Email Address"
                                            type="email"
                                            fullWidth
                                            variant="outlined"
                                            error={!!errors.email}
                                            helperText={errors.email ? 'Valid email is required' : ''}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Email color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    },
                                                },
                                            }}
                                            {...register('email', { required: true })}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Password"
                                            type="password"
                                            fullWidth
                                            variant="outlined"
                                            error={!!errors.password}
                                            helperText={errors.password ? 'Password is required' : 'Choose a strong password'}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Lock color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    },
                                                },
                                            }}
                                            {...register('password', { required: true })}
                                        />
                                    </Grid>

                                    {/* Professional Information Section */}
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label="Professional Details"
                                                color="secondary"
                                                variant="outlined"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            select
                                            label="Role"
                                            defaultValue=""
                                            fullWidth
                                            variant="outlined"
                                            error={!!errors.role}
                                            helperText={errors.role ? 'Please select a role' : ''}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Work color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    },
                                                },
                                            }}
                                            {...register('role', { required: true })}
                                        >
                                            <MenuItem value="">Select Role</MenuItem>
                                            <MenuItem value="engineer">Engineer</MenuItem>
                                            <MenuItem value="manager"> Manager</MenuItem>
                                        </TextField>
                                    </Grid>

                                    {selectedRole === 'engineer' && (
                                        <>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    select
                                                    label="Seniority Level"
                                                    defaultValue=""
                                                    fullWidth
                                                    variant="outlined"
                                                    error={!!errors.seniority}
                                                    helperText={errors.seniority ? 'Please select seniority level' : ''}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Star color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    {...register('seniority', { required: true })}
                                                >
                                                    <MenuItem value="">Select Seniority</MenuItem>
                                                    <MenuItem value="junior">Junior</MenuItem>
                                                    <MenuItem value="mid">Mid-Level</MenuItem>
                                                    <MenuItem value="senior">Senior</MenuItem>
                                                </TextField>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Department"
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="e.g., Engineering"
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <BusinessCenter color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    {...register('department')}
                                                />
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Max Capacity"
                                                    type="number"
                                                    fullWidth
                                                    variant="outlined"
                                                    error={!!errors.maxCapacity}
                                                    helperText={errors.maxCapacity ? 'Capacity is required' : 'Weekly work capacity (hours)'}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Speed color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    {...register('maxCapacity', { required: true, valueAsNumber: true })}
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Skills"
                                                    fullWidth
                                                    variant="outlined"
                                                    placeholder="React, Node.js, Python, etc."
                                                    multiline
                                                    rows={2}
                                                    helperText="Enter your skills separated by commas"
                                                    {...register('skills')}
                                                />
                                            </Grid>
                                        </>
                                    )}


                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            disabled={loading}
                                            sx={{
                                                mt: 2,
                                                py: 2,
                                                borderRadius: 3,
                                                fontSize: '1.1rem',
                                                fontWeight: 600,
                                                background: '#1976D2',
                                                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                                                    background: '#1976D2',
                                                },
                                                '&:disabled': {
                                                    background: '#ccc',
                                                    transform: 'none',
                                                },
                                            }}
                                        >
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </Button>
                                    </Grid>

                                    {(error || success) && (
                                        <Grid item xs={12}>
                                            <Fade in timeout={500}>
                                                <Box>
                                                    {error && (
                                                        <Alert
                                                            severity="error"
                                                            sx={{
                                                                borderRadius: 2,
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {error}
                                                        </Alert>
                                                    )}
                                                    {success && (
                                                        <Alert
                                                            severity="success"
                                                            sx={{
                                                                borderRadius: 2,
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {success}
                                                        </Alert>
                                                    )}
                                                </Box>
                                            </Fade>
                                        </Grid>
                                    )}
                                </Grid>
                            </form>
                        </Box>
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
};

export default Register;
