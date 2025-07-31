import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config';

function CommentSection({ postId, user, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const countAllComments = (commentsList) => {
    let total = commentsList.length;
    commentsList.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        total += comment.replies.length;
      }
    });
    return total;
  };

  const updateCommentCount = (commentsList) => {
    const totalCount = countAllComments(commentsList);
    if (onCommentCountChange) {
      onCommentCountChange(totalCount);
    }
  };

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/comments/post/${postId}`);
      const commentsData = response.data.comments || [];
      setComments(commentsData);
      updateCommentCount(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Please log in to comment');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/comments`,
        {
          content: newComment,
          postId: postId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const updatedComments = [response.data.comment, ...comments];
      setComments(updatedComments);
      updateCommentCount(updatedComments);
      setNewComment('');
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault();
    if (!user) {
      toast.warning('Please log in to reply');
      return;
    }
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/comments`,
        {
          content: replyText,
          postId: postId,
          parentCommentId: parentCommentId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const updatedComments = comments.map(comment => 
        comment._id === parentCommentId
          ? { ...comment, replies: [...(comment.replies || []), response.data.comment] }
          : comment
      );
      setComments(updatedComments);
      updateCommentCount(updatedComments);
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply posted successfully!');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (e, commentId) => {
    e.preventDefault();
    if (!editText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/comments/${commentId}`,
        { content: editText },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update the comment in the state (handle both main comments and replies)
      setComments(comments.map(comment => {
        if (comment._id === commentId) {
          // It's a main comment
          return response.data.comment;
        } else if (comment.replies && comment.replies.some(reply => reply._id === commentId)) {
          // It's a reply, update it in the replies array
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply._id === commentId ? response.data.comment : reply
            )
          };
        }
        return comment;
      }));

      setEditingComment(null);
      setEditText('');
      toast.success('Comment updated successfully!');
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Failed to edit comment. Please try again.');
    }
  };

  const confirmDelete = (commentId) => {
    toast.warn(
      <div>
        <p>Are you sure you want to delete this comment?</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={() => {
              toast.dismiss();
              handleDeleteComment(commentId);
            }}
            style={{ 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              padding: '5px 15px', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
          <button 
            onClick={() => toast.dismiss()}
            style={{ 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              padding: '5px 15px', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Check if it's a main comment or a reply
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          // It's a main comment, remove it entirely
          return null;
        } else if (comment.replies && comment.replies.some(reply => reply._id === commentId)) {
          // It's a reply, remove it from the replies array
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply._id !== commentId)
          };
        }
        return comment;
      }).filter(comment => comment !== null);

      setComments(updatedComments);
      updateCommentCount(updatedComments);
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment. Please try again.');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.warning('Please log in to like comments');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/comments/${commentId}/like`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setComments(comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            likes: response.data.isLiked 
              ? [...(comment.likes || []), user._id]
              : (comment.likes || []).filter(id => id !== user._id)
          };
        }
        
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = comment.replies.map(reply => {
            if (reply._id === commentId) {
              return {
                ...reply,
                likes: response.data.isLiked 
                  ? [...(reply.likes || []), user._id]
                  : (reply.likes || []).filter(id => id !== user._id)
              };
            }
            return reply;
          });
          return { ...comment, replies: updatedReplies };
        }
        
        return comment;
      }));
      
      if (response.data.isLiked) {
        toast.success('Comment liked! ❤️');
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = currentTime;
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
          return `${diffInDays}d ago`;
        } else {
          return date.toLocaleDateString();
        }
      }
    }
  };

  return (
    <div className="comment-section">
      <h3>Comments ({countAllComments(comments)})</h3>
      
      {user && (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <div className="comment-input-container">
            <img 
              src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=007bff&color=fff`}
              alt="Your avatar"
              className="comment-avatar"
            />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              rows="3"
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary comment-submit"
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="loading">Loading comments...</div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <img 
                  src={`https://ui-avatars.com/api/?name=${comment.user.firstName}+${comment.user.lastName}&background=007bff&color=fff`}
                  alt={`${comment.user.firstName} ${comment.user.lastName}`}
                  className="comment-avatar"
                />
                <div className="comment-meta">
                  <span className="comment-author">
                    {comment.user.firstName} {comment.user.lastName}
                  </span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  {comment.isEdited && <span className="edited-badge">(edited)</span>}
                </div>
              </div>
              
              <div className="comment-content">
                {editingComment === comment._id ? (
                  <form onSubmit={(e) => handleEditComment(e, comment._id)}>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="comment-input"
                      rows="3"
                    />
                    <div className="comment-edit-actions">
                      <button type="submit" className="btn btn-sm btn-primary">Save</button>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setEditingComment(null);
                          setEditText('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="comment-text">{comment.content}</p>
                )}
              </div>              <div className="comment-actions">
                {/* Debug info - remove this later */}
                {process.env.NODE_ENV === 'development' && (
                  <small style={{color: '#666', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem'}}>
                    Debug: Current user ID: {user?._id || 'Not logged in'} | Comment author ID: {comment.user._id} | 
                    Can edit/delete: {user && user._id === comment.user._id ? 'YES' : 'NO'}
                  </small>
                )}
                
                <button 
                  className={`comment-like-btn ${comment.likes?.includes(user?._id) ? 'liked' : ''}`}
                  onClick={() => handleLikeComment(comment._id)}
                  disabled={!user}
                >
                  ❤️ {comment.likes?.length || 0}
                </button>

                {user && (
                  <button 
                    className="comment-reply-btn"
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  >
                    Reply
                  </button>
                )}

                {user && user._id === comment.user._id && (
                  <>
                    <button 
                      className="comment-edit-btn"
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditText(comment.content);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className="comment-delete-btn"
                      onClick={() => confirmDelete(comment._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {replyingTo === comment._id && user && (
                <form onSubmit={(e) => handleSubmitReply(e, comment._id)} className="reply-form">
                  <div className="comment-input-container">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=007bff&color=fff`}
                      alt="Your avatar"
                      className="comment-avatar"
                    />
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="comment-input"
                      rows="2"
                    />
                  </div>
                  <div className="reply-actions">
                    <button 
                      type="submit" 
                      className="btn btn-sm btn-primary"
                      disabled={isSubmitting || !replyText.trim()}
                    >
                      {isSubmitting ? 'Replying...' : 'Reply'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="replies">
                  {comment.replies.map(reply => (
                    <div key={reply._id} className="reply">
                      <div className="comment-header">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${reply.user.firstName}+${reply.user.lastName}&background=007bff&color=fff`}
                          alt={`${reply.user.firstName} ${reply.user.lastName}`}
                          className="comment-avatar small"
                        />
                        <div className="comment-meta">
                          <span className="comment-author">
                            {reply.user.firstName} {reply.user.lastName}
                          </span>
                          <span className="comment-date">{formatDate(reply.createdAt)}</span>
                          {reply.isEdited && <span className="edited-badge">(edited)</span>}
                        </div>
                      </div>
                      <div className="comment-content">
                        {editingComment === reply._id ? (
                          <form onSubmit={(e) => handleEditComment(e, reply._id)}>
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="comment-input"
                              rows="3"
                            />
                            <div className="comment-edit-actions">
                              <button type="submit" className="btn btn-sm btn-primary">Save</button>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-secondary"
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditText('');
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="comment-text">{reply.content}</p>
                        )}
                      </div>
                      <div className="comment-actions">
                        {/* Debug info - remove this later */}
                        {process.env.NODE_ENV === 'development' && (
                          <small style={{color: '#666', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem'}}>
                            Debug: Current user ID: {user?._id || 'Not logged in'} | Reply author ID: {reply.user._id} | 
                            Can edit/delete: {user && user._id === reply.user._id ? 'YES' : 'NO'}
                          </small>
                        )}
                        
                        <button 
                          className={`comment-like-btn ${reply.likes?.includes(user?._id) ? 'liked' : ''}`}
                          onClick={() => handleLikeComment(reply._id)}
                          disabled={!user}
                        >
                          ❤️ {reply.likes?.length || 0}
                        </button>
                        
                        {user && user._id === reply.user._id && (
                          <>
                            <button 
                              className="comment-edit-btn"
                              onClick={() => {
                                setEditingComment(reply._id);
                                setEditText(reply.content);
                              }}
                            >
                              Edit
                            </button>
                            <button 
                              className="comment-delete-btn"
                              onClick={() => confirmDelete(reply._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="login-prompt">
          <p>Please log in to comment on this post.</p>
        </div>
      )}
    </div>
  );
}

export default CommentSection;
