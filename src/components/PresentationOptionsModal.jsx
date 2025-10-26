import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Box
} from '@mui/material';
import {
    PlayArrow,
    Analytics,
    Edit,
    VideoLibrary,
    Assessment
} from '@mui/icons-material';

const PresentationOptionsModal = ({ 
    open, 
    onClose, 
    presentation, 
    onVideoPlay, 
    onAnalyze, 
    onEdit 
}) => {
    const options = [
        {
            icon: <PlayArrow />,
            title: '비디오 재생',
            description: '업로드된 비디오를 재생합니다',
            action: onVideoPlay,
            color: 'primary'
        },
        {
            icon: <Analytics />,
            title: '분석 시작',
            description: '비디오 분석을 시작합니다',
            action: onAnalyze,
            color: 'success'
        },
        {
            icon: <Edit />,
            title: '프레젠테이션 수정',
            description: '제목, 목표시간 등을 수정합니다',
            action: onEdit,
            color: 'info'
        }
    ];

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6" component="div">
                    "{presentation?.title || '프레젠테이션'}"에 대해 무엇을 하시겠습니까?
                </Typography>
            </DialogTitle>
            
            <DialogContent>
                <List>
                    {options.map((option, index) => (
                        <ListItem key={index} disablePadding>
                            <ListItemButton 
                                onClick={() => {
                                    option.action();
                                    onClose();
                                }}
                                sx={{
                                    borderRadius: 1,
                                    mb: 1,
                                    '&:hover': {
                                        backgroundColor: `${option.color}.light`,
                                        '& .MuiListItemIcon-root': {
                                            color: `${option.color}.main`
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: `${option.color}.main` }}>
                                    {option.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={option.title}
                                    secondary={option.description}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    취소
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PresentationOptionsModal;
