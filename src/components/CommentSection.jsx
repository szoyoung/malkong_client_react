import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Paper,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';

const CommentSection = ({ presentationId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redux store에서 실제 사용자 정보 가져오기
  const user = useSelector(state => state.auth.user);
  
  // 현재 사용자 정보 설정
  const currentUser = user ? {
    id: user.userId || user.id || 1,
    name: user.name || user.username || user.email?.split('@')[0] || '사용자',
    email: user.email || 'user@example.com',
    avatar: user.avatar || null
  } : {
    id: 1,
    name: '사용자',
    email: 'user@example.com',
    avatar: null
  };

  // 임시 댓글 데이터 (실제로는 API에서 가져와야 함)
  const mockComments = [
    {
      id: 1,
      content: '발표 내용이 정말 좋았습니다! 특히 목소리 톤이 인상적이었어요.',
      author: {
        id: 2,
        name: '김철수',
        email: 'kim@example.com',
        avatar: null
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
      replies: [
        {
          id: 3,
          content: '동감합니다! 목소리 톤이 정말 좋았어요.',
          author: {
            id: 4,
            name: '이영희',
            email: 'lee@example.com',
            avatar: null
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1시간 전
          parentId: 1
        }
      ]
    },
    {
      id: 2,
      content: '발표 속도를 조금 더 천천히 하면 더 좋을 것 같아요.',
      author: {
        id: 5,
        name: '박민수',
        email: 'park@example.com',
        avatar: null
      },
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
      replies: []
    }
  ];

  useEffect(() => {
    // 실제로는 API 호출
    setComments(mockComments);
  }, [presentationId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      // 실제로는 API 호출
      const comment = {
        id: Date.now(),
        content: newComment,
        author: currentUser,
        createdAt: new Date(),
        replies: []
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setReplyTo(null);
    } catch (err) {
      setError('댓글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!editText.trim()) return;

    setLoading(true);
    try {
      // 실제로는 API 호출
      const reply = {
        id: Date.now(),
        content: editText,
        author: currentUser,
        createdAt: new Date(),
        parentId
      };

      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ));
      setEditText('');
      setReplyTo(null);
    } catch (err) {
      setError('답글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async () => {
    if (!editText.trim()) return;

    setLoading(true);
    try {
      // 실제로는 API 호출
      setComments(prev => prev.map(comment => 
        comment.id === editingComment.id 
          ? { ...comment, content: editText }
          : comment
      ));
      setEditText('');
      setEditingComment(null);
    } catch (err) {
      setError('댓글 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      // 실제로는 API 호출
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError('댓글 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderComment = (comment, isReply = false) => {
    const isAuthor = comment.author.id === currentUser.id;
    const isEditing = editingComment?.id === comment.id;
    const isReplying = replyTo?.id === comment.id;

    return (
      <ListItem
        key={comment.id}
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          pl: isReply ? 4 : 2,
          pr: 2,
          py: 1
        }}
      >
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
          <ListItemAvatar>
            <Avatar>
              {comment.author.avatar ? (
                <img src={comment.author.avatar} alt={comment.author.name} />
              ) : (
                comment.author.name.charAt(0)
              )}
            </Avatar>
          </ListItemAvatar>
          
          <Box sx={{ flex: 1, ml: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
                {comment.author.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(comment.createdAt)}
              </Typography>
              {isAuthor && (
                <Chip 
                  label="작성자" 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Box>

            {isEditing ? (
              <Box sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleEditComment}
                    disabled={loading}
                  >
                    수정
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setEditingComment(null);
                      setEditText('');
                    }}
                  >
                    취소
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {comment.content}
              </Typography>
            )}

            {!isEditing && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isReply && (
                  <Button
                    size="small"
                    startIcon={<ReplyIcon />}
                    onClick={() => setReplyTo(comment)}
                    disabled={isReplying}
                  >
                    답글
                  </Button>
                )}
                {isAuthor && (
                  <>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setEditingComment(comment);
                        setEditText(comment.content);
                      }}
                    >
                      수정
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      삭제
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {isReplying && !isReply && (
          <Box sx={{ width: '100%', mt: 2, pl: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="답글을 입력하세요..."
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={loading}
                startIcon={<SendIcon />}
              >
                답글 작성
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setReplyTo(null);
                  setEditText('');
                }}
              >
                취소
              </Button>
            </Box>
          </Box>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <Box sx={{ width: '100%', mt: 1 }}>
            {comment.replies.map(reply => renderComment(reply, true))}
          </Box>
        )}
      </ListItem>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '18px' }}>
        💬 댓글 ({comments.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* 댓글 작성 영역 */}
      <Box sx={{ mb: 3, backgroundColor: '#f8f9fa', p: 2, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Avatar sx={{ mt: 1 }}>
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              currentUser.name.charAt(0)
            )}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="영상에 대한 의견을 남겨주세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              disabled={loading}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || loading}
                startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
              >
                댓글 작성
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 댓글 목록 */}
      <Box>
        {comments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {comments.map(comment => renderComment(comment))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default CommentSection; 