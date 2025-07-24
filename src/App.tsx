import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import type { AuthState } from './store/authStore';

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';

const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ManagerDashboard = React.lazy(() => import('./pages/ManagerDashboard'));
const EngineerDashboard = React.lazy(() => import('./pages/EngineerDashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AvailabilityPlanning = React.lazy(() => import('./pages/AvailabilityMatrix'));

const App: React.FC = () => {
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout(); 
  };

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      useAuthStore.getState().setUser(JSON.parse(userData));
    }
  }, []);

  // Common button styles
  const buttonStyles = {
    color: 'black',
    borderRadius: 2,
    px: 2,
    py: 1,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#1976d2',
      color: 'white',
    },
    '&:active': {
      backgroundColor: '#1565c0',
      color: 'white',
    },
  };

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="h6" 
            fontWeight={500}
            sx={{ color: 'black' }}
          >
            Resource Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {user ? (
              <>
                <Button 
                  component={RouterLink} 
                  to="/profile" 
                  sx={buttonStyles}
                >
                  Profile
                </Button>
                {user.role === 'manager' && (
                  <Button 
                    component={RouterLink} 
                    to="/manager" 
                    sx={buttonStyles}
                  >
                    Manager Dashboard
                  </Button>
                )}
                {user.role === 'manager' && (
                  <Button 
                    component={RouterLink} 
                    to="/availability" 
                    sx={buttonStyles}
                  >
                    Team Availability
                  </Button>
                )}
                {user.role === 'engineer' && (
                  <Button 
                    component={RouterLink} 
                    to="/engineer" 
                    sx={buttonStyles}
                  >
                    Engineer Dashboard
                  </Button>
                )}
                <Button 
                  onClick={handleLogout} 
                  sx={{
                    ...buttonStyles,
                    '&:hover': {
                      backgroundColor: '#d32f2f',
                      color: 'white',
                    },
                    '&:active': {
                      backgroundColor: '#c62828',
                      color: 'white',
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  sx={buttonStyles}
                >
                  Login
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/register" 
                  sx={buttonStyles}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Suspense
        fallback={
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === 'manager' ? '/manager' : '/engineer'} />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to={user.role === 'manager' ? '/manager' : '/engineer'} />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/manager"
            element={
              user && user.role === 'manager' ? <ManagerDashboard /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/engineer"
            element={
              user && user.role === 'engineer' ? <EngineerDashboard /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/availability"
            element={
              user && user.role === 'manager' ? <AvailabilityPlanning /> : <Navigate to="/login" />
            }
          />

          <Route
            path="*"
            element={
              <Navigate to={user ? (user.role === 'manager' ? '/manager' : '/engineer') : '/login'} />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
