// components/Comment/Comment.jsx
import React, { useState,useEffect } from 'react';
import styled from 'styled-components';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BsThreeDots } from 'react-icons/bs';
import { updateComment, deleteComment } from '../../../api/cardApi';
import toast from 'react-hot-toast';

export default function Comment({ 
  comment, 
  onUpdate, 
  onDelete, 
  currentUserId 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const canEdit = currentUserId === comment.author?.id;

  const handleSave = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      setEditContent(comment.content);
      return;
    }

    setIsLoading(true);
    try {
      const updatedComment = await updateComment(comment.id, editContent);
      onUpdate(comment.id, updatedComment);
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: vi 
      });
    } catch {
      return 'Unknown time';
    }
  };

    useEffect(() => {
        if (!showMenu) return;
        const onDown = (e) => e.key === 'Escape' && setShowMenu(false);
        const onClick = (e) => !e.target.closest?.('[data-comment-menu]') && setShowMenu(false);
        window.addEventListener('keydown', onDown);
        window.addEventListener('mousedown', onClick);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('mousedown', onClick);
        };
    }, [showMenu]);

  return (
    <CommentWrapper>
      <Avatar>
        {comment.author?.avatar ? (
          <img src={comment.author.avatar} alt={comment.author.name} />
        ) : (
          <div>{comment.author?.name?.charAt(0) || 'U'}</div>
        )}
      </Avatar>
      
      <CommentContent>
        <CommentHeader>
          <AuthorName>
            {comment.author?.name || comment.author?.username || 'Unknown User'}
            </AuthorName>
          <CommentTime>{formatTime(comment.created_at)}</CommentTime>
          
          {canEdit && (
            <MenuContainer data-comment-menu > 
              <MenuButton 
                onClick={() => setShowMenu(!showMenu)}
                disabled={isLoading}
              >
                <BsThreeDots />
              </MenuButton>
              
              {showMenu && (
                <DropdownMenu>
                  <MenuItem onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}>
                    Edit
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleDelete();
                    setShowMenu(false);
                  }}>
                    Delete
                  </MenuItem>
                </DropdownMenu>
              )}
            </MenuContainer>
          )}
        </CommentHeader>

        {isEditing ? (
          <EditForm>
            <EditTextarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write a comment..."
              disabled={isLoading}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSave();
                if (e.key === 'Escape') handleCancel();
                }}

            />
            <ButtonGroup>
              <SaveButton 
                onClick={handleSave} 
                disabled={isLoading || !editContent.trim()}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </SaveButton>
              <CancelButton onClick={handleCancel} disabled={isLoading}>
                Cancel
              </CancelButton>
            </ButtonGroup>
          </EditForm>
        ) : (
          <CommentText>{comment.content}</CommentText>
        )}
      </CommentContent>
    </CommentWrapper>
  );
}

const CommentWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #dfe1e6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const CommentContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  position: relative;
`;

const AuthorName = styled.span`
  font-weight: 600;
  color: #172b4d;
  font-size: 14px;
`;

const CommentTime = styled.span`
  color: #6b778c;
  font-size: 12px;
`;

const MenuContainer = styled.div`
  position: relative;
  margin-left: auto;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  padding: 4px;
  border-radius: 3px;
  cursor: pointer;
  color: #6b778c;
  
  &:hover {
    background: #ebecf0;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  box-shadow: 0 8px 16px rgba(9,30,66,0.25);
  z-index: 1000;
  min-width: 100px;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #ebecf0;
  }
`;

const CommentText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #172b4d;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const EditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const EditTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 8px;
  font-size: 14px;
  border: 2px solid #28a745 ;
  border-radius: 3px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #026aa7;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const SaveButton = styled.button`
  background: #28a745 ;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;
  
  &:disabled {
    background: #a5adba;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: none;
  border: none;
  padding: 6px 12px;
  color: #6b778c;
  cursor: pointer;
  border-radius: 3px;
  
  &:hover {
    color: #172b4d;
  }
`;