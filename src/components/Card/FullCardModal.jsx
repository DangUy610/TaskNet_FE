import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BiLabel } from 'react-icons/bi';
import { BsClock } from 'react-icons/bs';
import { HiOutlineUserAdd } from 'react-icons/hi';
import { MdChecklist } from 'react-icons/md';
import { IoCloseOutline } from 'react-icons/io5';
import { IoChevronDown } from 'react-icons/io5';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

import axios from '../../api/apiClient';


export default function FullCardModal({ card, onClose,onCardUpdate  }) {
  const [title, setTitle] = useState(card.name || card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const overlayRef = useRef();
  const modalRef = useRef();

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempDesc, setTempDesc] = useState(description);


  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, { text: newComment, author: 'You', time: 'just now' }]);
      setNewComment('');
    }
  };

  const handleToggleComplete = async () => {
    const updated = !isComplete;
    setIsComplete(updated);
    try {
      await axios.patch(`/cards/${card.id}/`, { completed: updated });
    } catch (err) {
      console.error('Failed to update card completion:', err);
    }
  };

  const handleTitleSave = async () => {
    if (!title || title === card.name) return;

    // ✅ Gọi hàm callback trước để UI đổi tên ngay
    if (onCardUpdate) {
      onCardUpdate({ ...card, name: title });
    }

    try {
      await axios.patch(`/cards/${card.id}/`, { name:title });
    } catch (err) {
      console.error('Failed to save card title:', err);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
  };

  const handleSaveDescription  = async () => {
    if (tempDesc === description) {
      setIsEditingDesc(false);
      return;
    }

    try {
      await axios.patch(`/cards/${card.id}/`, { description: tempDesc });
      setDescription(tempDesc);
      setIsEditingDesc(false);
    } catch (err) {
      console.error('❌ Failed to save description:', err);
    }
  };

  const handleCancelDescription  = () => {
    setTempDesc(description);
    setIsEditingDesc(false);
  };


  useEffect(() => {
    if (card) {
      setTitle(card.name || card.title || '');
      setDescription(card.description || '');
      setIsComplete(!!card.completed); // đảm bảo đúng trạng thái ban đầu
    }
  }, [card]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const clickedOverlay = overlayRef.current?.contains(e.target);
      const clickedInsideModal = modalRef.current?.contains(e.target);

      if (clickedOverlay && !clickedInsideModal) {
        handleTitleSave();
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [title]);


  return (
    <Overlay  ref={overlayRef}>
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
                      placeholder="Write a description..."
                    />
                    <ButtonRow>
                      <SaveBtn onClick={handleSaveDescription}>Save</SaveBtn>
                      <CancelBtn onClick={handleCancelDescription}>Cancel</CancelBtn>
                    </ButtonRow>
                  </EditorBox>
                ) : (
                  <PreviewBox onClick={() => setIsEditingDesc(true)}>
                    {description ? <p>{description}</p> : <em>Add a more detailed description...</em>}
                  </PreviewBox>
                )}
              </DescriptionContent>
            </DescriptionSection>

          </MainColumn>

          <Sidebar>
            <Section>
              <SectionLabel>Comments and activity</SectionLabel>
              <CommentInput
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <CommentList>
                {comments.map((c, i) => (
                  <Comment key={i}>
                    <strong>{c.author}</strong> {c.text}
                    <Time>{c.time}</Time>
                  </Comment>
                ))}
                <Comment>
                  <strong>Hải Huỳnh</strong> added this card to Inbox
                  <Time>Jul 27, 2025, 12:42 PM</Time>
                </Comment>
              </CommentList>
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

const Section = styled.div`
  margin-top: 12px;
`;

const SectionLabel = styled.h4`
  font-size: 14px;
  margin-bottom: 8px;
`;


const CommentInput = styled.textarea`
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
  font-size: 14px;
  margin-bottom: 12px;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Comment = styled.div`
  background: #fafbfc;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
`;

const Time = styled.div`
  font-size: 12px;
  color: #6b778c;
  margin-top: 4px;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #172b4d;
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
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
`;

const SaveBtn = styled.button`
  background: #0c66e4;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
`;

const CancelBtn = styled.button`
  background: transparent;
  border: none;
  color: #5e6c84;
  font-weight: 500;
  cursor: pointer;
`;
