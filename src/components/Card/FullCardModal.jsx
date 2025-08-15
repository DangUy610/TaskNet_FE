import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { BiLabel } from 'react-icons/bi';
import { BsClock } from 'react-icons/bs';
import { HiOutlineUserAdd } from 'react-icons/hi';
import { MdChecklist } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { IoChevronDown } from 'react-icons/io5';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import toast from 'react-hot-toast';
import axios from '../../api/apiClient';

// Import new components
import Comment from './Comment/Comment';
import CommentInput from './Comment/CommentInput';
import { getCardComments, updateCardDescription } from '../../api/cardApi';

export default function FullCardModal({ 
  card, 
  onClose, 
  onCardUpdate,
  currentUser // Thêm prop currentUser
}) {
  const [title, setTitle] = useState(card.name || card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [comments, setComments] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const overlayRef = useRef();
  const modalRef = useRef();

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(description);
  const [loadingComments, setLoadingComments] = useState(false);
  const [saveState, setSaveState] = useState({ saving: false, error: null });

  // Load comments khi modal mở
  useEffect(() => {
    if (card?.id) {
      loadComments();
    }
  }, [card?.id]);

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const commentsData = await getCardComments(card.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleCommentAdded = (c) => {
    setComments(prev => [c, ...prev]);
  };

  const handleCommentReplaced = (tempId, real) => {
    setComments(prev =>
      prev.map(c => (c.temp_id === tempId ? { ...real } : c))
    );
  };

  const handleCommentRemove = (tempId) => {
    setComments(prev => prev.filter(c => c.temp_id !== tempId));
  };

  const handleCommentUpdated = (commentId, updatedComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, ...updatedComment }
          : comment
      )
    );
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const handleToggleComplete = async () => {
    const updated = !isComplete;
    setIsComplete(updated);
    try {
      await axios.patch(`/cards/${card.id}/`, { completed: updated });
      onCardUpdate({ ...card, completed: updated });
    } catch (err) {
      console.error('Failed to update card completion:', err);
      setIsComplete(!updated); // Revert on error
    }
  };

  const handleTitleSave = async () => {
    if (!title || title === card.name) return;
    
    const originalTitle = card.name;
    setSaveState({ saving: true, error: null });
    
    try {
      // Optimistic update
      onCardUpdate({ ...card, name: title });
      await axios.patch(`/cards/${card.id}/`, { name: title });
    } catch (err) {
      // Rollback on error
      onCardUpdate({ ...card, name: originalTitle });
      setSaveState({ saving: false, error: err.message });
      toast.error('Failed to save title');
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
  };

  const handleSaveDescription = async () => {
    if (tempDesc === description) {
      setIsEditingDesc(false);
      return;
    }

    setSaveState({ saving: true, error: null });
    try {
      await updateCardDescription(card.id, tempDesc);
      setDescription(tempDesc);
      onCardUpdate({ ...card, description: tempDesc });
      setIsEditingDesc(false);
      toast.success('Description updated');
    } catch (err) {
      console.error('❌ Failed to save description:', err);
      toast.error('Failed to save description');
    } finally {
      setSaveState({ saving: false, error: null });
    }
  };

  const handleCancelDescription = () => {
    setTempDesc(description);
    setIsEditingDesc(false);
  };

  useEffect(() => {
    if (card) {
      setTitle(card.name || card.title || '');
      setDescription(card.description || '');
      setTempDesc(card.description || '');
      setIsComplete(!!card.completed);
    }
  }, [card]);

  const handleClickOutside = useCallback((e) => {
    const clickedOverlay = overlayRef.current?.contains(e.target);
    const clickedInsideModal = modalRef.current?.contains(e.target);

    if (clickedOverlay && !clickedInsideModal) {
      handleTitleSave();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Mock current user nếu chưa có
  const mockCurrentUser = currentUser || {
    id: 1,
    name: 'You',
    avatar: null
  };

  return (
    <Overlay ref={overlayRef}>
      <ModalContainer ref={modalRef}>
        <HeaderBar>
          <HeaderLeft>
            <TitleButton aria-label="Open card menu">
              <CardTitle>{title}</CardTitle>
              <DropIcon aria-hidden="true">
                <IoChevronDown size={20} />
              </DropIcon>
            </TitleButton>
          </HeaderLeft>
          <HeaderRight>
            <IconBtn title="Feedback" aria-label="Feedback">📢</IconBtn>
            <IconBtn title="Cover" aria-label="Cover">🖼️</IconBtn>
            <IconBtn title="Actions" aria-label="Actions">⋯</IconBtn>
            <CloseBtn onClick={onClose} aria-label="Close">
              <IoCloseOutline size={24} />
            </CloseBtn>
          </HeaderRight>
        </HeaderBar>

        <ContentBody>
          <MainColumn>
            <TitleSection>
              <TitleCheckboxWrapper>
                <CompleteCheckbox
                  type="checkbox"
                  checked={isComplete}
                  onChange={handleToggleComplete}
                  aria-label={`Mark this card complete (${title})`}
                />
              </TitleCheckboxWrapper>
              <TitleContent>
                <EditableTitle
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleSave}
                  placeholder="Card title"
                />
              </TitleContent>
            </TitleSection>

            <ActionSectionGrid>
              <EmptyIconSpace />
              <ActionSectionBody>
                <ActionButton><span>+ Add</span></ActionButton>
                <ActionButton><BiLabel /> Labels</ActionButton>
                <ActionButton><BsClock /> Dates</ActionButton>
                <ActionButton><MdChecklist /> Checklist</ActionButton>
                <ActionButton><HiOutlineUserAdd /> Members</ActionButton>
              </ActionSectionBody>
            </ActionSectionGrid>

            <DescriptionSection>
              <DescriptionIconWrapper>
                <HiOutlineMenuAlt2 size={20} />
              </DescriptionIconWrapper>
              <DescriptionContent>
                <SectionHeading>Description</SectionHeading>
                {isEditingDesc ? (
                  <EditorBox>
                    <Textarea
                      value={tempDesc}
                      onChange={(e) => setTempDesc(e.target.value)}
                      placeholder="Add a more detailed description..."
                      disabled={saveState.saving}
                    />
                    <ButtonRow>
                      <SaveBtn 
                        onClick={handleSaveDescription}
                        disabled={saveState.saving}
                      >
                        {saveState.saving ? 'Saving...' : 'Save'}
                      </SaveBtn>
                      <CancelBtn 
                        onClick={handleCancelDescription}
                        disabled={saveState.saving}
                      >
                        Cancel
                      </CancelBtn>
                    </ButtonRow>
                  </EditorBox>
                ) : (
                  <PreviewBox onClick={() => setIsEditingDesc(true)}>
                    {description ? 
                      <DescriptionText>{description}</DescriptionText> : 
                      <PlaceholderText>Add a more detailed description...</PlaceholderText>
                    }
                  </PreviewBox>
                )}
              </DescriptionContent>
            </DescriptionSection>
          </MainColumn>

          <Sidebar>
            <Section>
              <SectionLabel>Add a comment</SectionLabel>
              <CommentInput
                cardId={card.id}
                onCommentAdded={handleCommentAdded}
                currentUser={mockCurrentUser}
                placeholder="Write a comment..."
                onCommentReplaced={handleCommentReplaced}
                onCommentRemove={handleCommentRemove}
              />
              
              <ActivityHeader>
                <SectionLabel>Activity</SectionLabel>
                {comments.length > 0 && (
                  <ShowDetailsButton>Show details</ShowDetailsButton>
                )}
              </ActivityHeader>
              
              {loadingComments ? (
                <LoadingText>Loading comments...</LoadingText>
              ) : (
                <CommentList>
                  {comments.map((comment) => (
                    <Comment
                      key={comment.id ?? comment.temp_id}
                      comment = {comment}
                      onUpdate={handleCommentUpdated}
                      onDelete={handleCommentDeleted}
                      currentUserId={mockCurrentUser.id}
                    />
                  ))}
                  
                  {/* Activity item mẫu */}
                  <ActivityItem>
                    <ActivityAvatar>H</ActivityAvatar>
                    <ActivityContent>
                      <ActivityText>
                        <strong>Hải Huỳnh</strong> added this card to <strong>Inbox</strong>
                      </ActivityText>
                      <ActivityTime>Jul 27, 2025, 12:42 PM</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>
                  
                  {comments.length === 0 && !loadingComments && (
                    <EmptyState>No comments yet. Be the first to comment!</EmptyState>
                  )}
                </CommentList>
              )}
            </Section>
          </Sidebar>
        </ContentBody>
      </ModalContainer>
    </Overlay>
  );
}


const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(9, 30, 66, 0.48);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 48px;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 960px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 8px 12px rgba(9, 30, 66, 0.15), 0 0 1px rgba(9, 30, 66, 0.3);
`;

const HeaderBar = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #dfe1e6;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const TitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  font-weight: 600;
  color: #172b4d;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    background-color: #f1f2f4;
  }
`;

const CardTitle = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DropIcon = styled.span`
  font-size: 18px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #172b4d;
`;

const ContentBody = styled.div`
  display: flex;
  flex-direction: row;
`;

const MainColumn = styled.div`
  flex: 2;
  padding: 24px 20px 16px;
`;

const Sidebar = styled.div`
  flex: 1;
  padding: 24px 20px;
  border-left: 1px solid #dfe1e6;
`;

const TitleSection = styled.section`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
  padding: 24px 20px 16px;
  margin-bottom: 32px;
`;

const TitleCheckboxWrapper = styled.div`
  padding-top: 4px;
`;

const TitleContent = styled.div`
  display: flex;
  align-items: center;
`;

const EditableTitle = styled.input`
  font-size: 20px;
  font-weight: 600;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
`;

const CompleteCheckbox = styled.input`
  width: 20px;
  height: 20px;
  accent-color: #61bd4f;
  cursor: pointer;
`;

const ActionSectionGrid = styled.section`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
  margin-bottom: 32px;
`;

const ActionSectionBody = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EmptyIconSpace = styled.div``;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #f4f5f7;
  border: 1px solid #dfe1e6;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: #e9f2ff;
  }
`;

const DescriptionSection = styled.section`
  display: grid;
  grid-template-columns: 36px 1fr;
  column-gap: 12px;
  margin-bottom: 32px;
`;

const DescriptionIconWrapper = styled.div`
  padding-top: 4px;
  color: #44546f;
`;

const DescriptionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeading = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin: 0;
  min-height: 32px;
  display: flex;
  align-items: center;
`;

const PreviewBox = styled.div`
  background: #f4f5f7;
  border-radius: 6px;
  padding: 12px;
  min-height: 40px;
  cursor: pointer;
  font-size: 14px;
  color: #172b4d;

  &:hover {
    background: #ebecf0;
  }
`;

const DescriptionText = styled.p`
  margin: 0;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const PlaceholderText = styled.em`
  color: #6b778c;
`;

const EditorBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: 10px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #dfe1e6;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #28a745 
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const SaveBtn = styled.button`
  background: #28a745;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  
  &:disabled {
    background: #a5adba;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled.button`
  background: transparent;
  border: none;
  color: #5e6c84;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 12px;
  
  &:hover {
    color: #172b4d;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionLabel = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin: 0 0 8px 0;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ShowDetailsButton = styled.button`
  background: none;
  border: none;
  color: #6b778c;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: #172b4d;
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoadingText = styled.div`
  color: #6b778c;
  font-style: italic;
  text-align: center;
  padding: 20px;
`;

const EmptyState = styled.div`
  color: #6b778c;
  font-style: italic;
  text-align: center;
  padding: 20px;
  background: #fafbfc;
  border-radius: 6px;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f2f4;
`;

const ActivityAvatar = styled.div`
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
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 14px;
  color: #172b4d;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #6b778c;
`;