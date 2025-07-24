import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import type { AuthState } from '../store/authStore';
import { apiFetch } from '../utils/api';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
  Fade,
  Stack,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LoginOutlined,
} from '@mui/icons-material';

interface LoginForm {
  email: string;
  password: string;
}

interface ApiError {
  message: string;
  field?: string;
  code?: string;
}

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    clearErrors,
  } = useForm<LoginForm>({
    mode: 'onBlur', // Validate on blur for better UX
  });

  const login = useAuthStore((state: AuthState) => state.login);
  const navigate = useNavigate();

  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    clearErrors(); // Clear any previous form errors

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle different types of API errors
        if (result.errors && Array.isArray(result.errors)) {
          // Handle field-specific validation errors
          result.errors.forEach((err: ApiError) => {
            if (err.field === 'email') {
              setFormError('email', { type: 'server', message: err.message });
            } else if (err.field === 'password') {
              setFormError('password', { type: 'server', message: err.message });
            }
          });
        } else {
          // Handle general error messages
          throw new Error(result.message || 'Login failed. Please try again.');
        }
        return;
      }

      // ✅ Save to localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // ✅ Update Zustand store
      login(result.user, result.token);

      // ✅ Redirect based on user role
      const redirectPath = result.user.role === 'manager' ? '/manager' : '/engineer';
      navigate(redirectPath, { replace: true });

    } catch (err: unknown) {
      console.error('Login error:', err);
      
      if (err instanceof Error) {
        // Handle network errors
        if (err.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        py: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          borderRadius: 4,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Header Section */}
          <Box textAlign="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LoginOutlined sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              color="primary"
              gutterBottom
            >
              Welcome Back
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Sign in to your account to continue
            </Typography>
            
            <Divider sx={{ width: '60px', mx: 'auto', height: 2, bgcolor: 'primary.main' }} />
          </Box>

          {/* Form Section */}
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)} 
            noValidate 
            sx={{ width: '100%' }}
          >
            <Stack spacing={3}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color={errors.email ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                variant="outlined"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color={errors.password ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    boxShadow: '0 4px 8px 2px rgba(25, 118, 210, .4)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                    boxShadow: 'none',
                  },
                }}
              >
                {loading ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={20} color="inherit" />
                    <Typography variant="inherit">Signing in...</Typography>
                  </Stack>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Error Display */}
              <Fade in={!!error}>
                <div>
                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          width: '100%',
                        },
                      }}
                      onClose={() => setError(null)}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {error}
                      </Typography>
                    </Alert>
                  )}
                </div>
              </Fade>
            </Stack>
          </Box>

          {/* Footer */}
          <Typography 
            variant="caption" 
            color="text.secondary" 
            textAlign="center"
            sx={{ mt: 2 }}
          >
            Having trouble signing in? Contact your system administrator.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Login;