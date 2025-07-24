import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import type { AuthState } from '../store/authStore';
import type { Project } from '../types/project';
import { apiFetch } from '../utils/api';
import DeleteProjectDialog from './DeleteDialogManagerDash'; // Import the new component
import {
    CircularProgress, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, Chip, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

interface Engineer {
    _id: string;
    name: string;
    skills: string[];
    seniority: string;
    department: string;
    maxCapacity: number;
    availableCapacity: number;
    totalAllocated: number;
}
const ManagerDashboard: React.FC = () => {
const user = useAuthStore((state: AuthState) => state.user);
const [projects, setProjects] = useState<Project[]>([]);
const [engineers, setEngineers] = useState<Engineer[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [openCreate, setOpenCreate] = useState(false);
const [openAssign, setOpenAssign] = useState(false);
const [selectedProject, setSelectedProject] = useState<Project | null>(null);
const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('All Status');
const [priorityFilter, setPriorityFilter] = useState('All Priority');

    // Delete dialog state
 const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        project: Project | null;
        loading: boolean;
    }>({
        open: false,
        project: null,
        loading: false
    });

    // Create Project Form State
    const [newProject, setNewProject] = useState<Partial<Project & { requiredSkills: string; startDate: string; endDate: string }>>({
        name: '',
        description: '',
        requiredSkills: '',
        teamSize: 1,
        status: 'planning',
        startDate: '',
        endDate: '',
        assignments: [],
        priority: 'medium', // Set medium as default
    });

    // Assignment State
    const [assignEngineerId, setAssignEngineerId] = useState('');
    const [assignPercent, setAssignPercent] = useState(0);

    useEffect(() => {
        fetchProjects();
        fetchEngineers();
        // eslint-disable-next-line
    }, [user]);

    const fetchProjects = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`/api/projects/search?managerId=${user._id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to fetch projects');
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unexpected error');
        } finally {
            setLoading(false);
        }
    };

    const fetchEngineers = async () => {
        try {
            const res = await apiFetch('/api/projects/capacity');
            const data = await res.json();
            setEngineers(data);
        } catch {
            // ignore
        }
    };

    const CircularProgressWithLabel = (props: {
        value: number;
        size?: number;
        thickness?: number;
        variant?: 'determinate' | 'indeterminate';
        color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
        showLabel?: boolean;
    }) => {
        return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                    variant={props.variant || 'determinate'}
                    value={props.value}
                    size={props.size || 24}
                    thickness={props.thickness || 4}
                    color={props.color}
                />
                {(props.showLabel !== false) && (
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="caption" component="div" color="text.secondary">
                            {`${Math.round(props.value)}%`}
                        </Typography>
                    </Box>
                )}
            </Box>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'success';
            case 'completed': return 'primary';
            case 'planning': return 'warning';
            case 'on hold': return 'error';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const selectedEngineer = engineers.find(e => e._id === assignEngineerId) || null;

    // Calculate project statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const planningProjects = projects.filter(p => p.status === 'planning').length;

    const handleCreateProject = async () => {
        try {
            const res = await apiFetch('/api/projects', {
                method: 'POST',
                body: JSON.stringify({
                    ...newProject,
                    requiredSkills: newProject.requiredSkills?.split(',').map(s => s.trim()),
                    managerId: user?._id,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create project');
            setSnackbar({ open: true, message: 'Project created!', severity: 'success' });
            setOpenCreate(false);
            setNewProject({ name: '', description: '', requiredSkills: '', teamSize: 1, status: 'planning', startDate: '', endDate: '', priority: 'medium' });
            fetchProjects();
        } catch (err) {
            setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Error', severity: 'error' });
        }
    };

    // Updated delete handler
    const handleDeleteProject = async () => {
        if (!deleteDialog.project) return;
        
        setDeleteDialog(prev => ({ ...prev, loading: true }));
        
        try {
            const res = await apiFetch(`/api/projects/${deleteDialog.project._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            
            setSnackbar({ open: true, message: 'Project deleted successfully!', severity: 'success' });
            setDeleteDialog({ open: false, project: null, loading: false });
            fetchProjects();
        } catch (err) {
            setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Error deleting project', severity: 'error' });
            setDeleteDialog(prev => ({ ...prev, loading: false }));
        }
    };

    // Open delete dialog
    const openDeleteDialog = (project: Project) => {
        setDeleteDialog({
            open: true,
            project,
            loading: false
        });
    };

    // Close delete dialog
    const closeDeleteDialog = () => {
        setDeleteDialog({
            open: false,
            project: null,
            loading: false
        });
    };

    const handleAssignEngineer = async () => {
        console.log("selectedEngineer",selectedEngineer);
        
        if (!selectedProject || !selectedEngineer) return;
        
        try {
            const res = await apiFetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: selectedProject._id,
                    engineerId: selectedEngineer?.engineerId,
                    allocationPercentage: assignPercent,
                    startDate: selectedProject.startDate,
                    endDate: selectedProject.endDate,
                    role: 'Developer',
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to assign engineer');
            setSnackbar({ open: true, message: 'Engineer assigned!', severity: 'success' });
            setOpenAssign(false);
            setAssignEngineerId('');
            setAssignPercent(0);
            fetchEngineers();
            fetchProjects();
        } catch (err) {
            setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Error', severity: 'error' });
        }
    };

    const handleUnassign = async (projectId: string, engineerId: string) => {
        if (!window.confirm('Unassign this engineer?')) return;
        try {
            const res = await apiFetch(`/api/assignments/unassign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, engineerId }),
            });
            if (!res.ok) throw new Error('Failed to unassign engineer');
            setSnackbar({ open: true, message: 'Engineer unassigned!', severity: 'success' });
            fetchProjects();
            fetchEngineers();
        } catch (err) {
            setSnackbar({ open: true, message: err instanceof Error ? err.message : 'Error', severity: 'error' });
        }
    };

    const isAssignmentValid = () => {
        if (!selectedEngineer || assignPercent <= 0) return false;
        return assignPercent <= selectedEngineer.availableCapacity;
    };

    // Enhanced filtering function
    const filteredProjects = projects.filter(project => {
        // Search in project name, required skills, and priority
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            project.name.toLowerCase().includes(searchLower) ||
            project.description?.toLowerCase().includes(searchLower) ||
            (project.requiredSkills && project.requiredSkills.some(skill => 
                skill.toLowerCase().includes(searchLower)
            )) ||
            (project.priority && project.priority.toLowerCase().includes(searchLower));

        const matchesStatus = statusFilter === 'All Status' || project.status === statusFilter.toLowerCase();
        const matchesPriority = priorityFilter === 'All Priority' || (project.priority || 'medium') === priorityFilter.toLowerCase();
        
        return matchesSearch && matchesStatus && matchesPriority;
    });
    console.log(projects);
    
    return (
        <Box sx={{ p: 4, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Typography variant="h4" fontWeight={700} mb={4}>Manager Dashboard</Typography>
            
            {/* Summary Cards Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            borderRadius: '50%', 
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <TrendingUpIcon fontSize="large" />
                        </Box>
                        <Typography variant="h3" fontWeight={700}>
                            {totalProjects}
                        </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600} mb={0.5}>
                        Total Projects
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        All projects in system
                    </Typography>
                    <Chip 
                        label="+2 this month" 
                        size="small" 
                        sx={{ 
                            mt: 2, 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            fontWeight: 600
                        }} 
                    />
                </Paper>

                {/* Active Projects Card */}
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            borderRadius: '50%', 
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <ScheduleIcon fontSize="large" />
                        </Box>
                        <Typography variant="h3" fontWeight={700}>
                            {activeProjects}
                        </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600} mb={0.5}>
                        Active Projects
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Currently running
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        In progress
                    </Typography>
                </Paper>

                {/* Completed Projects Card */}
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            borderRadius: '50%', 
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircleIcon fontSize="large" />
                        </Box>
                        <Typography variant="h3" fontWeight={700}>
                            {completedProjects}
                        </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600} mb={0.5}>
                        Completed
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Successfully finished
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        This quarter
                    </Typography>
                </Paper>

                {/* Team Members Card */}
                <Paper sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            borderRadius: '50%', 
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <GroupIcon fontSize="large" />
                        </Box>
                        <Typography variant="h3" fontWeight={700}>
                            {engineers.length}
                        </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={600} mb={0.5}>
                        Team Members
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Across all projects
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        Active members
                    </Typography>
                </Paper>
            </Box>

            {/* Project Management Section */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={600} mb={1}>
                            Project Management
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage and track all your projects and assignments
                        </Typography>
                    </Box>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => setOpenCreate(true)}
                        sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        New Project
                    </Button>
                </Box>

                {/* Enhanced Search and Filter */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                        placeholder="Search by name, skills, or priority..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        sx={{ 
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'white'
                            }
                        }}
                    />
                    <FormControl sx={{ minWidth: 150 }}>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            displayEmpty
                            startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                            sx={{ 
                                borderRadius: 2,
                                bgcolor: 'white',
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }}
                        >
                            <MenuItem value="All Status">All Status</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="planning">Planning</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 150 }}>
                        <Select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            displayEmpty
                            sx={{ 
                                borderRadius: 2,
                                bgcolor: 'white',
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }}
                        >
                            <MenuItem value="All Priority">All Priority</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            
            {!loading && !error && (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Project Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Timeline</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Team</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Required Skills</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Priority</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProjects.map((project, index) => (
                                <TableRow 
                                    key={project._id}
                                    sx={{ 
                                        '&:hover': { bgcolor: '#f8fafc' },
                                        borderLeft: '4px solid',
                                        borderColor: getStatusColor(project.status) === 'success' ? '#10b981' : 
                                                   getStatusColor(project.status) === 'warning' ? '#f59e0b' :
                                                   getStatusColor(project.status) === 'primary' ? '#3b82f6' : '#6b7280'
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar 
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32, 
                                                    bgcolor: getStatusColor(project.status) === 'success' ? '#10b981' : 
                                                           getStatusColor(project.status) === 'warning' ? '#f59e0b' :
                                                           getStatusColor(project.status) === 'primary' ? '#3b82f6' : '#6b7280',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {project.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {project.name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={project.status.charAt(0).toUpperCase() + project.status.slice(1)} 
                                            color={getStatusColor(project.status)} 
                                            size="small" 
                                            sx={{ 
                                                fontWeight: 600,
                                                textTransform: 'capitalize'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>
                                                {new Date(project.startDate).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                to {new Date(project.endDate).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <GroupIcon fontSize="small" color="primary" />
                                            <Typography variant="body2" fontWeight={500}>
                                                {project.assignments?.length || 0}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {project.requiredSkills?.slice(0, 2).map(skill => (
                                                <Chip 
                                                    key={skill} 
                                                    label={skill} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            ))}
                                            {project.requiredSkills && project.requiredSkills.length > 2 && (
                                                <Chip 
                                                    label={`+${project.requiredSkills.length - 2}`}
                                                    size="small"
                                                    sx={{ fontSize: '0.75rem', bgcolor: 'grey.100' }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={project.priority} 
                                            color={getPriorityColor(project.priority || 'medium')} 
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => { 
                                                    setSelectedProject(project); 
                                                    setOpenAssign(true); 
                                                }}
                                                sx={{ 
                                                    bgcolor: 'success.50',
                                                    color: 'success.main',
                                                    '&:hover': { bgcolor: 'success.100' }
                                                }}
                                            >
                                                <GroupAddIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                onClick={() => openDeleteDialog(project)}
                                                sx={{ 
                                                    bgcolor: 'error.50',
                                                    '&:hover': { bgcolor: 'error.100' }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create Project Dialog */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
                <DialogTitle>Create Project</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 400 }}>
                    <TextField label="Name" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} fullWidth required />
                    <TextField label="Description" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} fullWidth multiline />
                    <TextField label="Required Skills (comma separated)" value={newProject.requiredSkills} onChange={e => setNewProject(p => ({ ...p, requiredSkills: e.target.value }))} fullWidth />
                    <TextField label="Team Size" type="number" value={newProject.teamSize} onChange={e => setNewProject(p => ({ ...p, teamSize: Number(e.target.value) }))} fullWidth />
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={newProject.status} onChange={e => setNewProject(p => ({ ...p, status: e.target.value }))}>
                            <MenuItem value="planning">Planning</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select label="Priority" value={newProject.priority} onChange={e => setNewProject(p => ({ ...p, priority: e.target.value }))}>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField label="Start Date" type="date" value={newProject.startDate} onChange={e => setNewProject(p => ({ ...p, startDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
                    <TextField label="End Date" type="date" value={newProject.endDate} onChange={e => setNewProject(p => ({ ...p, endDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreateProject} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Assign Engineer Dialog */}
            <Dialog open={openAssign} onClose={() => setOpenAssign(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Assign Engineer to {selectedProject?.name}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Engineer</InputLabel>
                        <Select
                            label="Engineer"
                            value={assignEngineerId}
                            onChange={(e) => {
                                setAssignEngineerId(e.target.value);
                                setAssignPercent(0);
                            }}
                        >
                            {engineers.map((e) => {
                                const isAvailable = e.availableCapacity > 0;
                                const utilizationPercent = (e.totalAllocated / e.maxCapacity) * 100;
                                
                                return (
                                    <MenuItem
                                        key={e._id}
                                        value={e._id}
                                        disabled={!isAvailable}
                                        sx={{
                                            opacity: isAvailable ? 1 : 0.6,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 2,
                                            pr: 2,
                                            minHeight: 48,
                                        }}
                                    >
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {e.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {e.seniority} • {e.department}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgressWithLabel
                                                value={utilizationPercent}
                                                size={28}
                                                thickness={4}
                                                variant="determinate"
                                                color={utilizationPercent >= 90 ? 'error' : utilizationPercent >= 70 ? 'warning' : 'primary'}
                                            />
                                            <Typography variant="caption" color={isAvailable ? 'text.secondary' : 'error'}>
                                                {isAvailable ? `${e.availableCapacity}% free` : 'Full capacity'}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>

                    {selectedEngineer && (
                        <>
                            <Box sx={{ 
                                p: 2, 
                                bgcolor: 'grey.50', 
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'grey.200'
                            }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    {selectedEngineer.name} - Current Capacity
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CircularProgressWithLabel
                                        value={(selectedEngineer.totalAllocated / selectedEngineer.maxCapacity) * 100}
                                        size={40}
                                        thickness={4}
                                        variant="determinate"
                                        color="primary"
                                    />
                                    <Box>
                                        <Typography variant="body2">
                                            <strong>{selectedEngineer.totalAllocated}%</strong> allocated of {selectedEngineer.maxCapacity}%
                                        </Typography>
                                        <Typography variant="caption" color="success.main">
                                            <strong>{selectedEngineer.availableCapacity}%</strong> remaining capacity
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <TextField
                                    label="Allocation Percentage"
                                    type="number"
                                    value={assignPercent}
                                    onChange={(e) => {
                                        const value = Math.max(0, Number(e.target.value));
                                        setAssignPercent(Math.min(value, selectedEngineer.maxCapacity));
                                    }}
                                    fullWidth
                                    InputProps={{
                                        inputProps: {
                                            min: 1,
                                            max: selectedEngineer.availableCapacity,
                                        },
                                    }}
                                    error={assignPercent > selectedEngineer.availableCapacity}
                                    helperText={
                                        assignPercent > selectedEngineer.availableCapacity
                                            ? `Exceeds available capacity! Maximum: ${selectedEngineer.availableCapacity}%`
                                            : assignPercent > 0
                                            ? `Will allocate ${assignPercent}% of capacity`
                                            : 'Enter allocation percentage'
                                    }
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                        <CircularProgress
                                            variant="determinate"
                                            value={100}
                                            size={50}
                                            thickness={4}
                                            sx={{ color: (theme) => theme.palette.grey[200] }}
                                        />
                                        <CircularProgress
                                            variant="determinate"
                                            value={(selectedEngineer.totalAllocated / selectedEngineer.maxCapacity) * 100}
                                            size={50}
                                            thickness={4}
                                            sx={{
                                                position: 'absolute',
                                                left: 0,
                                                color: (theme) => theme.palette.info.main,
                                            }}
                                        />
                                        <CircularProgress
                                            variant="determinate"
                                            value={
                                                ((selectedEngineer.totalAllocated + assignPercent) / selectedEngineer.maxCapacity) * 100
                                            }
                                            size={50}
                                            thickness={4}
                                            sx={{
                                                position: 'absolute',
                                                left: 0,
                                                color: (theme) =>
                                                    assignPercent > selectedEngineer.availableCapacity
                                                        ? theme.palette.error.main
                                                        : theme.palette.primary.main,
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                top: 0,
                                                left: 0,
                                                bottom: 0,
                                                right: 0,
                                                position: 'absolute',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant="caption" component="div" color="text.secondary" fontWeight={600}>
                                                {Math.round(selectedEngineer.totalAllocated + assignPercent)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" align="center">
                                        After Assignment
                                    </Typography>
                                </Box>
                            </Box>

                            {assignPercent > selectedEngineer.availableCapacity && (
                                <Alert severity="error">
                                    Cannot assign {assignPercent}% - Engineer only has {selectedEngineer.availableCapacity}% available capacity remaining.
                                </Alert>
                            )}
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => {
                        setOpenAssign(false);
                        setAssignEngineerId('');
                        setAssignPercent(0);
                    }}>Cancel</Button>
                    <Button
                        onClick={handleAssignEngineer}
                        variant="contained"
                        disabled={!isAssignmentValid()}
                    >
                        Assign Engineer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Project Dialog */}
            <DeleteProjectDialog
                open={deleteDialog.open}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteProject}
                projectName={deleteDialog.project?.name || ''}
                loading={deleteDialog.loading}
            />
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ManagerDashboard;