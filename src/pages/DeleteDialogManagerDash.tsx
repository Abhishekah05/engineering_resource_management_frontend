import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';

interface DeleteProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    projectName: string;
    loading?: boolean;
}

const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
    open,
    onClose,
    onConfirm,
    projectName,
    loading = false
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'error.50',
                    color: 'error.main'
                }}>
                    <WarningIcon />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                    Delete Project
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ pb: 3 }}>
               
                
                <Typography variant="body1" gutterBottom>
                    Are you sure you want to delete the project:
                </Typography>
                
                <Typography 
                    variant="h6" 
                    fontWeight={600}
                    sx={{ 
                        color: 'error.main',
                        bgcolor: 'error.50',
                        p: 2,
                        borderRadius: 1,
                        mt: 1,
                        mb: 2
                    }}
                >
                    {projectName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                    This will also remove all associated assignments and project data.
                </Typography>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    disabled={loading}
                    sx={{ 
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none'
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={loading}
                    startIcon={loading ? undefined : <DeleteIcon />}
                    sx={{ 
                        borderRadius: 2,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    {loading ? 'Deleting...' : 'Delete Project'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteProjectDialog;