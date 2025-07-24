import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import type { User, AuthState } from '../store/authStore';
import { apiFetch } from '../utils/api';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Alert,
  Paper,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Fade,
  Slide,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Save as SaveIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';

const Profile: React.FC = () => {
  const user = useAuthStore((state: AuthState) => state.user);
  const setUser = useAuthStore((state: AuthState) => state.setUser);
  
  // Check if user is a manager
  const isManager = user?.role === 'manager' || user?.userType === 'manager';

  const { register, handleSubmit, reset, watch } = useForm<User>({
    defaultValues: user || {},
  });

  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const watchedSkills = watch('skills');
  const skillsArray = React.useMemo(() => {
    if (typeof watchedSkills === 'string' && watchedSkills) {
      return watchedSkills.split(',').map(s => s.trim()).filter(s => s);
    }
    return Array.isArray(watchedSkills) ? watchedSkills : [];
  }, [watchedSkills]);

  React.useEffect(() => {
    reset(user || {});
  }, [user, reset]);

  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const onSubmit = async (data: User) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const cleanedData = {
        ...data,
        skills: typeof data.skills === 'string' ? data.skills.split(',').map(s => s.trim()) : data.skills,
      };

      const res = await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(cleanedData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Update failed');

      setUser(result);
      localStorage.setItem('user', JSON.stringify(result));
      setSuccess('Profile updated successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const getSeniorityColor = (seniority: string) => {
    switch (seniority) {
      case 'junior': return '#4caf50';
      case 'mid': return '#ff9800';
      case 'senior': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  if (!user) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 ,  }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header Section */}
          <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              background: '#1976D2',
              borderRadius: 3,
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
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                fontSize: '2rem',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Typography 
              variant="h3" 
              fontWeight="600" 
              gutterBottom
              sx={{ position: 'relative', zIndex: 1 }}
            >
              My Profile
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                opacity: 0.9, 
                maxWidth: 500, 
                mx: 'auto',
                position: 'relative',
                zIndex: 1,
              }}
            >
              Manage your professional information and preferences
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Skills Preview Card - Only for non-managers */}
            {!isManager && skillsArray.length > 0 && (
              <Grid item xs={12}>
                <Slide direction="up" in timeout={600}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                        <PsychologyIcon sx={{ mr: 1, color: '#1976D2' }} />
                        Current Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {skillsArray.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            variant="outlined"
                            sx={{
                              borderColor: '#1976D2',
                              color: '#1976D2',
                              '&:hover': {
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            )}

            {/* Form Section */}
            <Grid item xs={12}>
              <Slide direction="up" in timeout={800}>
                <Paper 
                  elevation={8} 
                  sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  }}
                >
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Grid container spacing={3}>
                      {/* Full Name */}
                      <Grid item xs={12} sm={isManager ? 12 : 6}>
                        <TextField
                          label="Full Name"
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              },
                            },
                          }}
                          {...register('name', { required: true })}
                        />
                      </Grid>

                      {/* Email Address  */}
                      <Grid item xs={12} sm={isManager ? 12 : 6}>
                        <TextField
                          label="Email Address"
                          type="email"
                          fullWidth
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#6366f1',
                              },
                            },
                          }}
                          {...register('email', { required: true })}
                        />
                      </Grid>

                      {/* Fields only for non-managers */}
                      {!isManager && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Department"
                              fullWidth
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <BusinessIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6366f1',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6366f1',
                                  },
                                },
                              }}
                              {...register('department')}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              select
                              label="Seniority Level"
                              fullWidth
                              required
                              variant="outlined"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <TrendingUpIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6366f1',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6366f1',
                                  },
                                },
                              }}
                              {...register('seniority', { required: true })}
                            >
                              <MenuItem value="">Select Seniority Level</MenuItem>
                              <MenuItem value="junior">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: 12, 
                                      height: 12, 
                                      borderRadius: '50%', 
                                      bgcolor: getSeniorityColor('junior'),
                                      mr: 1 
                                    }} 
                                  />
                                  Junior
                                </Box>
                              </MenuItem>
                              <MenuItem value="mid">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: 12, 
                                      height: 12, 
                                      borderRadius: '50%', 
                                      bgcolor: getSeniorityColor('mid'),
                                      mr: 1 
                                    }} 
                                  />
                                  Mid-Level
                                </Box>
                              </MenuItem>
                              <MenuItem value="senior">
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box 
                                    sx={{ 
                                      width: 12, 
                                      height: 12, 
                                      borderRadius: '50%', 
                                      bgcolor: getSeniorityColor('senior'),
                                      mr: 1 
                                    }} 
                                  />
                                  Senior
                                </Box>
                              </MenuItem>
                            </TextField>
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              label="Skills (comma separated)"
                              fullWidth
                              multiline
                              rows={2}
                              variant="outlined"
                              placeholder="React, TypeScript, Node.js, Python..."
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                                    <PsychologyIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6366f1',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6366f1',
                                  },
                                },
                              }}
                              {...register('skills')}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Maximum Capacity"
                              type="number"
                              fullWidth
                              required
                              variant="outlined"
                              inputProps={{ min: 1, max: 100 }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <SpeedIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6366f1',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6366f1',
                                  },
                                },
                              }}
                              {...register('maxCapacity', { required: true, valueAsNumber: true })}
                            />
                          </Grid>
                        </>
                      )}

                      <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                      </Grid>

                      <Grid item xs={12} >
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                     
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            background: '#1976D2',
                            ml: -2,
                           
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.37)',
                            '&:hover': {
                              background: '#1976D2)',
                              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
                              transform: 'translateY(-2px)',
                            },
                            '&:disabled': {
                              background: '#1976D2',
                            },
                            transition: 'all 0.3s ease',
                        
                          }}
                        >
                          {loading ? 'Saving Changes...' : 'Save Profile'}
                        </Button>
                      </Grid>

                      {/* Alert Messages */}
                      {success && (
                        <Grid item xs={12}>
                          <Fade in>
                            <Alert 
                              severity="success" 
                              sx={{ 
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                  fontSize: '1.5rem',
                                },
                              }}
                            >
                              {success}
                            </Alert>
                          </Fade>
                        </Grid>
                      )}
                      {error && (
                        <Grid item xs={12}>
                          <Fade in>
                            <Alert 
                              severity="error"
                              sx={{ 
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                  fontSize: '1.5rem',
                                },
                              }}
                            >
                              {error}
                            </Alert>
                          </Fade>
                        </Grid>
                      )}
                    </Grid>
                  </form>
                </Paper>
              </Slide>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
};

export default Profile;